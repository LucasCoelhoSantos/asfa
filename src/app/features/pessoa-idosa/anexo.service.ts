import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';

@Injectable({ providedIn: 'root' })
export class AnexoService {
  private storage = inject(Storage);

  /**
   * Faz upload de um anexo para o Storage, retorna a URL e o caminho salvo
   * Aceita apenas .png, .jpeg, .pdf
   */
  async uploadAnexo(pessoaId: string, tipoAnexo: number,file: File): Promise<{ url: string, path: string }> {
    if (!this.isFileAllowed(file)) {
      throw new Error('Tipo de arquivo não permitido.');
    }
    file = await this.comprimirArquivo(file);
    const safeFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const path = `pessoas-idosas/${pessoaId}/anexos/tipo/${tipoAnexo}_${Date.now()}_${safeFileName}`;
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  }

  /**
   * Retorna a URL de download de um anexo
   */
  getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  /**
   * Remove um anexo do Storage
   */
  deleteAnexo(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }

  /**
   * Verifica se o arquivo é permitido
   */
  isFileAllowed(file: File): boolean {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    return allowed.includes(file.type);
  }

  /**
   * (Stub) Comprime o arquivo se for imagem. Implementação futura.
   */
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