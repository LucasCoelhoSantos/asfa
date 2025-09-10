import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateEmail, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

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
    const cred = await createUserWithEmailAndPassword(this.auth, usuario.email, senha);
    
    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo,
      createdAt: new Date(),
      createdBy: this.auth.currentUser?.uid
    });
  }

  async updateSelf(usuario: Partial<Usuario>): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    if (usuario.email && currentUser.email !== usuario.email) {
      await updateEmail(currentUser, usuario.email);
    }

    const docRef = doc(this.firestore, 'usuarios', currentUser.uid);
    await updateDoc(docRef, usuario);
  }

  async update(id: string, usuario: Partial<Usuario>): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, {
      ...usuario,
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser?.uid
    });
  }

  async setAtivo(id: string, ativo: boolean): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, {
      ativo,
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser?.uid
    });
  }
}