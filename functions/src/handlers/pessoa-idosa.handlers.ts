import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { ServicoAuditoria } from '../services/audit.service';
import { ServicoMetricas } from '../services/metrics.service';
import { ServicoArmazenamento } from '../services/storage.service';
import { PessoaIdosaData, AuditAction, Collection } from '../types';

export const onPessoaIdosaCreated = onDocumentCreated(`${Collection.PESSOAS_IDOSAS}/{id}`, async (event) => {
  const id = event.params.id as string;
  const after = event.data?.data() as PessoaIdosaData;

  if (!after) {
    console.warn('Dados de pessoa idosa não encontrados na criação');
    return;
  }

  try {
    await ServicoAuditoria.writePessoaIdosaAudit(
      id,
      AuditAction.CREATE,
      null,
      after,
      after.createdBy || null
    );

    await ServicoMetricas.incrementPessoas(1);
    console.log(`Pessoa idosa criada: ${id}`);
  } catch (error) {
    console.error('Erro ao processar criação de pessoa idosa:', error);
  }
});

export const onPessoaIdosaUpdated = onDocumentUpdated(`${Collection.PESSOAS_IDOSAS}/{id}`, async (event) => {
  const id = event.params.id as string;
  const before = event.data?.before.data() as PessoaIdosaData;
  const after = event.data?.after.data() as PessoaIdosaData;

  if (!after) {
    console.warn('Dados de pessoa idosa não encontrados na atualização');
    return;
  }

  try {
    // Determinar ação baseada na mudança de status
    let action = AuditAction.UPDATE;
    if (before?.ativo !== after?.ativo) {
      action = after?.ativo ? AuditAction.ACTIVATE : AuditAction.INACTIVATE;
    }

    // Auditoria
    await ServicoAuditoria.writePessoaIdosaAudit(
      id,
      action,
      before,
      after,
      after.updatedBy || null
    );

    // Limpar anexos removidos
    const removedPaths = ServicoArmazenamento.extractRemovedAnexoPaths(
      before?.anexos,
      after?.anexos
    );

    if (removedPaths.length > 0) {
      await ServicoArmazenamento.deleteFiles(removedPaths);
      console.log(`${removedPaths.length} anexos removidos para pessoa ${id}`);
    }

    console.log(`Pessoa idosa ${action}: ${id}`);
  } catch (error) {
    console.error('Erro ao processar atualização de pessoa idosa:', error);
  }
});

export const onPessoaIdosaDeleted = onDocumentDeleted(`${Collection.PESSOAS_IDOSAS}/{id}`, async (event) => {
  const id = event.params.id as string;
  const before = event.data?.data() as PessoaIdosaData;

  try {
    // Deletar anexos do storage
    const anexos = before?.anexos || [];
    const anexoPaths = ServicoArmazenamento.getAnexoPaths(anexos);
    
    if (anexoPaths.length > 0) {
      await ServicoArmazenamento.deleteFiles(anexoPaths);
      console.log(`${anexoPaths.length} anexos removidos para pessoa ${id}`);
    }

    // Auditoria
    await ServicoAuditoria.writePessoaIdosaAudit(
      id,
      AuditAction.DELETE,
      before,
      null,
      null
    );

    // Decrementar métrica
    await ServicoMetricas.incrementPessoas(-1);

    console.log(`Pessoa idosa deletada: ${id}`);
  } catch (error) {
    console.error('Erro ao processar exclusão de pessoa idosa:', error);
  }
});
