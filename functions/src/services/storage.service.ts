import { getStorage } from 'firebase-admin/storage';
import { AnexoData } from '../types';

export class StorageService {
  static async deleteFile(path: string): Promise<void> {
    if (!path) return;
    
    try {
      const bucket = getStorage().bucket();
      await bucket.file(path).delete({ ignoreNotFound: true });
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${path}:`, error);
      // Não falha a operação principal por erro de storage
    }
  }

  static async deleteFiles(paths: string[]): Promise<void> {
    const validPaths = paths.filter(Boolean);
    if (validPaths.length === 0) return;

    await Promise.all(validPaths.map(path => this.deleteFile(path)));
  }

  static extractRemovedAnexoPaths(
    beforeAnexos: AnexoData[] | undefined,
    afterAnexos: AnexoData[] | undefined
  ): string[] {
    const beforePaths = new Set(
      (beforeAnexos || [])
        .map(anexo => anexo?.path)
        .filter(Boolean)
    );
    
    const afterPaths = new Set(
      (afterAnexos || [])
        .map(anexo => anexo?.path)
        .filter(Boolean)
    );

    const removed: string[] = [];
    beforePaths.forEach(path => {
      if (!afterPaths.has(path)) {
        removed.push(path as string);
      }
    });

    return removed;
  }

  static getAnexoPaths(anexos: AnexoData[]): string[] {
    return anexos
      .map(anexo => anexo?.path)
      .filter(Boolean) as string[];
  }
}
