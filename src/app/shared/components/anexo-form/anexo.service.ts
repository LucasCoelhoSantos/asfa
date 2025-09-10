import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';

@Injectable({ providedIn: 'root' })
export class AnexoService {
  private storage = inject(Storage);

  async uploadAnexo(pessoaId: string, tipoAnexo: number, file: File): Promise<{ url: string, path: string }> {
    this.validateFile(file);
    
    const processedFile = await this.comprimirArquivo(file);
    const path = this.generateStoragePath(pessoaId, tipoAnexo, processedFile);
    const storageRef = ref(this.storage, path);
    
    await uploadBytes(storageRef, processedFile);
    const url = await getDownloadURL(storageRef);
    
    return { url, path };
  }

  private validateFile(file: File): void {
    if (!this.isFileAllowed(file)) {
      throw new Error('Tipo de arquivo não permitido.');
    }
  }

  private generateStoragePath(pessoaId: string, tipoAnexo: number, file: File): string {
    const safeFileName = this.sanitizeFileName(file.name);
    return `pessoas-idosas/${pessoaId}/anexos/tipo/${tipoAnexo}_${Date.now()}_${safeFileName}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  }

  getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  deleteAnexo(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }

  isFileAllowed(file: File): boolean {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    return allowed.includes(file.type);
  }

  private async comprimirArquivo(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      return file;
    }
  }
}