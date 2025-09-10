import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { AuditService } from '../services/audit.service';
import { MetricsService } from '../services/metrics.service';
import { StorageService } from '../services/storage.service';
import { PessoaIdosaData, AuditAction } from '../types';

export const onPessoaIdosaCreated = onDocumentCreated('pessoas-idosas/{id}', async (event) => {
  const id = event.params.id as string;
  const after = event.data?.data() as PessoaIdosaData;

  if (!after) {
    console.warn('Dados de pessoa idosa não encontrados na criação');
    return;
  }

  try {
    await AuditService.writePessoaIdosaAudit(
      id,
      AuditAction.CREATE,
      null,
      after,
      after.createdBy || null
    );

    await MetricsService.incrementPessoas(1);
    console.log(`Pessoa idosa criada: ${id}`);
  } catch (error) {
    console.error('Erro ao processar criação de pessoa idosa:', error);
  }
});

export const onPessoaIdosaUpdated = onDocumentUpdated('pessoas-idosas/{id}', async (event) => {
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
    await AuditService.writePessoaIdosaAudit(
      id,
      action,
      before,
      after,
      after.updatedBy || null
    );

    // Limpar anexos removidos
    const removedPaths = StorageService.extractRemovedAnexoPaths(
      before?.anexos,
      after?.anexos
    );

    if (removedPaths.length > 0) {
      await StorageService.deleteFiles(removedPaths);
      console.log(`${removedPaths.length} anexos removidos para pessoa ${id}`);
    }

    console.log(`Pessoa idosa ${action}: ${id}`);
  } catch (error) {
    console.error('Erro ao processar atualização de pessoa idosa:', error);
  }
});

export const onPessoaIdosaDeleted = onDocumentDeleted('pessoas-idosas/{id}', async (event) => {
  const id = event.params.id as string;
  const before = event.data?.data() as PessoaIdosaData;

  try {
    // Deletar anexos do storage
    const anexos = before?.anexos || [];
    const anexoPaths = StorageService.getAnexoPaths(anexos);
    
    if (anexoPaths.length > 0) {
      await StorageService.deleteFiles(anexoPaths);
      console.log(`${anexoPaths.length} anexos removidos para pessoa ${id}`);
    }

    // Auditoria
    await AuditService.writePessoaIdosaAudit(
      id,
      AuditAction.DELETE,
      before,
      null,
      null
    );

    // Decrementar métrica
    await MetricsService.incrementPessoas(-1);

    console.log(`Pessoa idosa deletada: ${id}`);
  } catch (error) {
    console.error('Erro ao processar exclusão de pessoa idosa:', error);
  }
});
