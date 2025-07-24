import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Usuario } from '../../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private collectionRef = collection(this.firestore, 'usuarios');

  getAll(): Observable<Usuario[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<Usuario[]>;
  }

  getById(id: string): Observable<Usuario | undefined> {
    const docRef = doc(this.firestore, 'usuarios', id);
    return docData(docRef, { idField: 'id' }) as Observable<Usuario | undefined>;
  }

  async create(usuario: Omit<Usuario, 'id'>, senha: string): Promise<void> {
    // Cria usuário no Auth
    const cred = await createUserWithEmailAndPassword(this.auth, usuario.email, senha);
    // Salva dados extras no Firestore
    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo
    });
  }

  async update(id: string, usuario: Partial<Usuario>): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, usuario);
  }

  async delete(id: string): Promise<void> {
    // Remove do Firestore
    const docRef = doc(this.firestore, 'usuarios', id);
    await deleteDoc(docRef);
    // Opcional: remover do Auth (requer autenticação do usuário)
  }

  async setAtivo(id: string, ativo: boolean): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, { ativo });
  }
}