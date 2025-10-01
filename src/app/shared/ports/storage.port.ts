import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface UploadResultado {
  url: string;
  path: string;
  nome: string;
}

export const STORAGE_PORT = new InjectionToken<StoragePort>('STORAGE_PORT');

export interface StoragePort {
  upload(arquivo: File, path: string): Observable<UploadResultado>;
  delete(path: string): Observable<void>;
}
