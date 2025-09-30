import { InjectionToken } from '@angular/core';

export interface UploadResultado { url: string; path: string; }

export abstract class StoragePort {
  abstract upload(pessoaId: string, categoria: number, arquivo: File): Promise<UploadResultado>;
  abstract remover(path: string): Promise<void>;
}

export const STORAGE_PORT = new InjectionToken<StoragePort>('STORAGE_PORT');


