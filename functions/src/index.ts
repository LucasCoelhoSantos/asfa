import { onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp } from 'firebase-admin/app';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();
const db = getFirestore();
const auth = getAuth();
const bucket = getStorage().bucket();

// ========== Helpers ==========
function nowTs(): number { return Date.now(); }

async function writeAudit(collection: string, docId: string, action: string, beforeData: any, afterData: any, actorUid: string | null) {
  const auditRef = db.collection('audits').doc();
  await auditRef.set({
    collection,
    docId,
    action,
    actorUid: actorUid ?? null,
    before: beforeData ?? null,
    after: afterData ?? null,
    timestamp: nowTs(),
  });
}

async function incrementMetric(field: string, delta: number) {
  const ref = db.collection('metrics').doc('global');
  await ref.set({ [field]: FieldValue.increment(delta) }, { merge: true });
}

async function deleteStoragePath(path: string) {
  if (!path) return;
  try {
    await bucket.file(path).delete({ ignoreNotFound: true });
  } catch {
    // Ignora erros de exclusão (ex.: já deletado)
  }
}

function extractRemovedAnexoPaths(beforeAnexos: any[] | undefined, afterAnexos: any[] | undefined): string[] {
  const beforePaths = new Set((beforeAnexos || []).map(a => a?.path).filter(Boolean));
  const afterPaths = new Set((afterAnexos || []).map(a => a?.path).filter(Boolean));
  const removed: string[] = [];
  beforePaths.forEach(p => { if (!afterPaths.has(p)) removed.push(p as string); });
  return removed;
}

// ========== HTTPS Callable de exemplo ==========
export const ping = onCall(async (request) => {
  const name = (request.data?.name as string) || 'mundo';
  return { message: `Pong, ${name}!`, timestamp: nowTs() };
});

// ========== Rate-limit simples (Callable) ==========
export const limitedAction = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error('Não autenticado');
  }
  const ref = db.collection('rate_limits').doc(uid);
  const snap = await ref.get();
  const now = nowTs();
  const windowMs = 60_000;
  const limit = 10;

  const data = snap.exists ? snap.data() as any : null;
  const windowStart = data?.windowStart ?? now;
  let count = data?.count ?? 0;

  if (now - windowStart > windowMs) {
    // reinicia janela
    await ref.set({ windowStart: now, count: 1 }, { merge: true });
  } else {
    if (count >= limit) {
      throw new Error('Muitas requisições. Tente novamente em instantes.');
    }
    await ref.set({ windowStart, count: count + 1 }, { merge: true });
  }

  return { ok: true, timestamp: now };
});

// ========== Usuários: sync com Auth ==========
export const onUsuarioUpdated = onDocumentUpdated('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const before = event.data?.before.data() as any;
  const after = event.data?.after.data() as any;
  if (!after) return;

  const updates: { email?: string, disabled?: boolean } = {};
  if (before?.email !== after?.email && after?.email) {
    updates.email = after.email;
  }
  if (before?.ativo !== after?.ativo && typeof after?.ativo === 'boolean') {
    updates.disabled = !after.ativo;
  }

  if (Object.keys(updates).length > 0) {
    await auth.updateUser(uid, updates as any).catch(() => {});
  }

  // Auditoria
  const actorUid = after?.updatedBy || null; // se o front popular
  await writeAudit('usuarios', uid, 'update', before, after, actorUid);
});

export const onUsuarioDeleted = onDocumentDeleted('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const before = event.data?.data() as any;
  
  await auth.deleteUser(uid).catch(() => {});

  await db.collection('rate_limits').doc(uid).delete().catch(() => {});

  await writeAudit('usuarios', uid, 'delete', before, null, null);
  
  await incrementMetric('usuarios', -1);
});

export const onUsuarioCreated = onDocumentCreated('usuarios/{uid}', async (event) => {
  const uid = event.params.uid as string;
  const after = event.data?.data() as any;

  await writeAudit('usuarios', uid, 'create', null, after, after?.createdBy || null);

  await incrementMetric('usuarios', 1);
});

// ========== Pessoa Idosa: auditoria, contadores, anexos ==========
export const onPessoaIdosaCreated = onDocumentCreated('pessoas-idosas/{id}', async (event) => {
  const id = event.params.id as string;
  const after = event.data?.data() as any;
  await writeAudit('pessoas-idosas', id, 'create', null, after, after?.createdBy || null);
  await incrementMetric('pessoas', 1);
});

export const onPessoaIdosaUpdated = onDocumentUpdated('pessoas-idosas/{id}', async (event) => {
  const id = event.params.id as string;
  const before = event.data?.before.data() as any;
  const after = event.data?.after.data() as any;

  let action = 'update';
  if (before?.ativo !== after?.ativo) {
    action = after?.ativo ? 'activate' : 'inactivate';
  }
  const actorUid = after?.updatedBy || null;
  await writeAudit('pessoas-idosas', id, action, before, after, actorUid);

  const removedPaths = extractRemovedAnexoPaths(before?.anexos, after?.anexos);
  await Promise.all(removedPaths.map(deleteStoragePath));
});

export const onPessoaIdosaDeleted = onDocumentDeleted('pessoas-idosas/{id}', async (event) => {
  const id = event.params.id as string;
  const before = event.data?.data() as any;

  const anexos = (before?.anexos as any[]) || [];
  await Promise.all((anexos.map(a => a?.path).filter(Boolean) as string[]).map(deleteStoragePath));
  
  await writeAudit('pessoas-idosas', id, 'delete', before, null, null);
  await incrementMetric('pessoas', -1);
});

// ========== Backups agendados (semanal) ==========
export const weeklyBackup = onSchedule('every monday 02:00', async (_event) => {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const prefix = `backups/${yyyy}-${mm}-${dd}`;

  async function exportCollection(col: string) {
    const snap = await db.collection(col).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const file = bucket.file(`${prefix}/${col}.json`);
    await file.save(JSON.stringify(data, null, 2), { contentType: 'application/json' });
  }

  await exportCollection('usuarios');
  await exportCollection('pessoas-idosas');

  // Retenção: manter apenas os 4 últimos backups
  const [files] = await bucket.getFiles({ prefix: 'backups/' });
  const foldersSet = new Set<string>();
  for (const f of files) {
    const name = f.name; // ex.: backups/2025-01-15/usuarios.json
    const parts = name.split('/');
    if (parts.length >= 2) {
      foldersSet.add(`${parts[0]}/${parts[1]}`);
    }
  }
  const folders = Array.from(foldersSet);
  folders.sort((a, b) => b.localeCompare(a));
  const toDelete = folders.slice(4);

  for (const folder of toDelete) {
    const [oldFiles] = await bucket.getFiles({ prefix: `${folder}/` });
    await Promise.all(oldFiles.map(f => f.delete({ ignoreNotFound: true })));
  }
});
