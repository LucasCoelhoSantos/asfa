import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateEmail, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private collectionRef = collection(this.firestore, 'usuarios');

  obterTodos(): Observable<Usuario[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<Usuario[]>;
  }

  obterPorId(id: string): Observable<Usuario | undefined> {
    const docRef = doc(this.firestore, 'usuarios', id);
    return docData(docRef, { idField: 'id' }) as Observable<Usuario | undefined>;
  }

  async criar(usuario: Omit<Usuario, 'id'>, senha: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, usuario.email, senha);
    
    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      ativo: usuario.ativo,
      createdAt: new Date(),
      createdBy: this.auth.currentUser?.uid
    });
  }

  async editarPerfil(usuario: Partial<Usuario>): Promise<void> {
    const usuarioAtual = this.auth.currentUser;
    if (!usuarioAtual) return;

    if (usuario.email && usuarioAtual.email !== usuario.email) {
      await updateEmail(usuarioAtual, usuario.email);
    }

    const docRef = doc(this.firestore, 'usuarios', usuarioAtual.uid);
    await updateDoc(docRef, usuario);
  }

  async editar(id: string, usuario: Partial<Usuario>): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, {
      ...usuario,
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser?.uid
    });
  }

  async setarAtivo(id: string, ativo: boolean): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', id);
    await updateDoc(docRef, {
      ativo,
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser?.uid
    });
  }
}