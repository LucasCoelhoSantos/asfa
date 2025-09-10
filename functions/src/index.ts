// Initialize Firebase Admin FIRST
import { initializeApp } from 'firebase-admin/app';
initializeApp();

// Then import everything else
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { RateLimitService } from './services/rate-limit.service';
import { BackupService } from './services/backup.service';
import { onUsuarioCreated, onUsuarioUpdated, onUsuarioDeleted } from './handlers/usuario.handlers';
import { onPessoaIdosaCreated, onPessoaIdosaUpdated, onPessoaIdosaDeleted } from './handlers/pessoa-idosa.handlers';
import { BACKUP_CONFIG } from './types';

// ========== HTTPS Callable Functions ==========
export const ping = onCall(async (request) => {
  const name = (request.data?.name as string) || 'mundo';
  return { 
    message: `Pong, ${name}!`, 
    timestamp: Date.now() 
  };
});

export const limitedAction = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error('Não autenticado');
  }

  const isAllowed = await RateLimitService.checkRateLimit(uid);
  if (!isAllowed) {
    throw new Error('Muitas requisições. Tente novamente em instantes.');
  }

  return { 
    ok: true, 
    timestamp: Date.now() 
  };
});

// ========== Firestore Triggers ==========
// Usuários
export { onUsuarioCreated, onUsuarioUpdated, onUsuarioDeleted };

// Pessoas Idosas
export { onPessoaIdosaCreated, onPessoaIdosaUpdated, onPessoaIdosaDeleted };

// ========== Scheduled Functions ==========
export const weeklyBackup = onSchedule(BACKUP_CONFIG.schedule, async (_event) => {
  try {
    await BackupService.createBackup();
  } catch (error) {
    console.error('Erro no backup semanal:', error);
  }
});
