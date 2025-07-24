import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class AnexoService {
  private storage = inject(Storage);

  /**
   * Faz upload de um anexo para o Storage, retorna a URL e o caminho salvo
   * Aceita apenas .png, .jpeg, .pdf
   */
  async uploadAnexo(pessoaId: string, file: File): Promise<{ url: string, path: string }> {
    if (!this.isFileAllowed(file)) {
      throw new Error('Tipo de arquivo não permitido.');
    }
    // TODO: Comprimir arquivo se for imagem (stub)
    // file = await this.comprimirArquivo(file);
    const ext = file.name.split('.').pop();
    const path = `pessoas-idosas/${pessoaId}/anexos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
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
  async comprimirArquivo(file: File): Promise<File> {
    // TODO: Implementar compressão de imagem
    return file;
  }
}