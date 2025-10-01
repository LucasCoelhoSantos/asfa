import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StoragePort, UploadResultado } from '../../shared/ports/storage.port';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageAdapter implements StoragePort {
  private storage: Storage = inject(Storage);

  upload(arquivo: File, path: string): Observable<UploadResultado> {
    const storageRef = ref(this.storage, path);
    
    return from(uploadBytes(storageRef, arquivo)).pipe(
      switchMap(uploadResult => from(getDownloadURL(uploadResult.ref))),
      map(url => {
        return {
          url: url,
          path: path,
          nome: arquivo.name,
        };
      })
    );
  }

  delete(path: string): Observable<void> {
    const storageRef = ref(this.storage, path);
    return from(deleteObject(storageRef));
  }
}