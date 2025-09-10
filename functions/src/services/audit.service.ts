import { getFirestore } from 'firebase-admin/firestore';
import { AuditRecord, AuditAction, Collection, UsuarioData, PessoaIdosaData } from '../types';

export class AuditService {
  private static nowTs(): number {
    return Date.now();
  }

  static async writeAudit(
    collection: string,
    docId: string,
    action: AuditAction,
    beforeData: any,
    afterData: any,
    actorUid: string | null
  ): Promise<void> {
    try {
      const db = getFirestore();
      const auditRef = db.collection(Collection.AUDITS).doc();
      const auditRecord: AuditRecord = {
        collection,
        docId,
        action,
        actorUid: actorUid ?? null,
        before: beforeData ?? null,
        after: afterData ?? null,
        timestamp: this.nowTs(),
      };
      
      await auditRef.set(auditRecord);
    } catch (error) {
      console.error('Erro ao escrever auditoria:', error);
      // Não falha a operação principal por erro de auditoria
    }
  }

  static async writeUserAudit(
    uid: string,
    action: AuditAction,
    beforeData: UsuarioData | null,
    afterData: UsuarioData | null,
    actorUid: string | null = null
  ): Promise<void> {
    return this.writeAudit(Collection.USUARIOS, uid, action, beforeData, afterData, actorUid);
  }

  static async writePessoaIdosaAudit(
    id: string,
    action: AuditAction,
    beforeData: PessoaIdosaData | null,
    afterData: PessoaIdosaData | null,
    actorUid: string | null = null
  ): Promise<void> {
    return this.writeAudit(Collection.PESSOAS_IDOSAS, id, action, beforeData, afterData, actorUid);
  }
}
