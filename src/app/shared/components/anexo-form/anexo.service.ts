import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';

@Injectable({ providedIn: 'root' })
export class AnexoService {
  private storage = inject(Storage);

  async uploadAnexo(pessoaId: string, categoria: number, arquivo: File): Promise<{ url: string, path: string }> {
    this.validarArquivo(arquivo);
    
    const processedFile = await this.comprimirArquivo(arquivo);
    const path = this.gerarCaminhoDeArmazenamento(pessoaId, categoria, processedFile);
    const storageRef = ref(this.storage, path);
    
    await uploadBytes(storageRef, processedFile);
    const url = await getDownloadURL(storageRef);
    
    return { url, path };
  }

  private validarArquivo(arquivo: File): void {
    if (!this.eUmArquivoPermitido(arquivo)) {
      throw new Error('Tipo de arquivo não permitido.');
    }
  }

  private gerarCaminhoDeArmazenamento(pessoaId: string, categoria: number, arquivo: File): string {
    const nomeDeArquivoSeguro = this.limparNomeDoArquivo(arquivo.name);
    return `pessoas-idosas/${pessoaId}/anexos/categoria/${categoria}_${Date.now()}_${nomeDeArquivoSeguro}`;
  }

  private limparNomeDoArquivo(fileName: string): string {
    return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  }

  obterUrlDeDownload(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  deletarAnexo(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }

  eUmArquivoPermitido(arquivo: File): boolean {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    return allowed.includes(arquivo.type);
  }

  private async comprimirArquivo(arquivo: File): Promise<File> {
    if (!arquivo.type.startsWith('image/')) {
      return arquivo;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: arquivo.type
    };

    try {
      const compressedFile = await imageCompression(arquivo, options);
      return compressedFile;
    } catch (error) {
      return arquivo;
    }
  }
}