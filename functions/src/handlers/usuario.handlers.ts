import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { AuditService } from '../services/audit.service';
import { MetricsService } from '../services/metrics.service';
import { RateLimitService } from '../services/rate-limit.service';
import { UsuarioData, AuditAction } from '../types';

export const onUsuarioCreated = onDocumentCreated('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const after = event.data?.data() as UsuarioData;

  if (!after) {
    console.warn('Dados de usuário não encontrados na criação');
    return;
  }

  try {
    await AuditService.writeUserAudit(
      uid,
      AuditAction.CREATE,
      null,
      after,
      after.createdBy || null
    );

    await MetricsService.incrementUsuarios(1);
    console.log(`Usuário criado: ${uid}`);
  } catch (error) {
    console.error('Erro ao processar criação de usuário:', error);
  }
});

export const onUsuarioUpdated = onDocumentUpdated('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const before = event.data?.before.data() as UsuarioData;
  const after = event.data?.after.data() as UsuarioData;

  if (!after) {
    console.warn('Dados de usuário não encontrados na atualização');
    return;
  }

  try {
    // Sincronizar com Firebase Auth
    const updates: { email?: string; disabled?: boolean } = {};
    
    if (before?.email !== after?.email && after?.email) {
      updates.email = after.email;
    }
    
    if (before?.ativo !== after?.ativo && typeof after?.ativo === 'boolean') {
      updates.disabled = !after.ativo;
    }

    if (Object.keys(updates).length > 0) {
      const auth = getAuth();
      await auth.updateUser(uid, updates);
      console.log(`Usuário ${uid} sincronizado com Auth`);
    }

    // Auditoria
    await AuditService.writeUserAudit(
      uid,
      AuditAction.UPDATE,
      before,
      after,
      after.updatedBy || null
    );

    console.log(`Usuário atualizado: ${uid}`);
  } catch (error) {
    console.error('Erro ao processar atualização de usuário:', error);
  }
});

export const onUsuarioDeleted = onDocumentDeleted('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const before = event.data?.data() as UsuarioData;

  try {
    // Deletar do Firebase Auth
    const auth = getAuth();
    await auth.deleteUser(uid);
    console.log(`Usuário ${uid} removido do Auth`);

    // Limpar rate limits
    await RateLimitService.clearRateLimit(uid);

    // Auditoria
    await AuditService.writeUserAudit(
      uid,
      AuditAction.DELETE,
      before,
      null,
      null
    );

    // Decrementar métrica
    await MetricsService.incrementUsuarios(-1);

    console.log(`Usuário deletado: ${uid}`);
  } catch (error) {
    console.error('Erro ao processar exclusão de usuário:', error);
  }
});
