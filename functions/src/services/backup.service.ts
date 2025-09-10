import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { BACKUP_CONFIG } from '../types';

export class BackupService {
  private static generateBackupPrefix(): string {
    const date = new Date();
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `backups/${yyyy}-${mm}-${dd}`;
  }

  private static async exportCollection(collectionName: string, prefix: string): Promise<void> {
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
      const snap = await db.collection(collectionName).get();
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const file = bucket.file(`${prefix}/${collectionName}.json`);
      
      await file.save(JSON.stringify(data, null, 2), { 
        contentType: 'application/json' 
      });
      
      console.log(`Backup da coleção ${collectionName} concluído`);
    } catch (error) {
      console.error(`Erro ao fazer backup da coleção ${collectionName}:`, error);
      throw error;
    }
  }

  private static async cleanupOldBackups(): Promise<void> {
    try {
      const bucket = getStorage().bucket();
      const [files] = await bucket.getFiles({ prefix: 'backups/' });
      const foldersSet = new Set<string>();
      
      for (const file of files) {
        const name = file.name; // ex.: backups/2025-01-15/usuarios.json
        const parts = name.split('/');
        if (parts.length >= 2) {
          foldersSet.add(`${parts[0]}/${parts[1]}`);
        }
      }
      
      const folders = Array.from(foldersSet);
      folders.sort((a, b) => b.localeCompare(a));
      const toDelete = folders.slice(BACKUP_CONFIG.retentionDays / 7); // 4 semanas

      for (const folder of toDelete) {
        const [oldFiles] = await bucket.getFiles({ prefix: `${folder}/` });
        await Promise.all(
          oldFiles.map(file => 
            file.delete({ ignoreNotFound: true })
          )
        );
        console.log(`Backup antigo removido: ${folder}`);
      }
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  static async createBackup(): Promise<void> {
    try {
      const prefix = this.generateBackupPrefix();
      console.log(`Iniciando backup: ${prefix}`);

      // Exportar todas as coleções
      await Promise.all(
        BACKUP_CONFIG.collections.map(collection => 
          this.exportCollection(collection, prefix)
        )
      );

      // Limpar backups antigos
      await this.cleanupOldBackups();
      
      console.log('Backup semanal concluído com sucesso');
    } catch (error) {
      console.error('Erro no backup semanal:', error);
      throw error;
    }
  }
}
