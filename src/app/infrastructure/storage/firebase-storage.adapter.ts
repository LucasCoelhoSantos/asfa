import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { StoragePort, UploadResultado } from '../../shared/components/anexo-form/storage.port';

@Injectable()
export class FirebaseStorageAdapter implements StoragePort {
  private storage = inject(Storage);

  async upload(pessoaId: string, categoria: number, arquivo: File): Promise<UploadResultado> {
    const path = this.gerarCaminhoDeArmazenamento(pessoaId, categoria, arquivo);
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, arquivo);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  }

  async remover(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  private gerarCaminhoDeArmazenamento(pessoaId: string, categoria: number, arquivo: File): string {
    const timestamp = Date.now();
    const safeName = arquivo.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `pessoas-idosas/${pessoaId}/${categoria}/${timestamp}-${safeName}`;
  }
}


