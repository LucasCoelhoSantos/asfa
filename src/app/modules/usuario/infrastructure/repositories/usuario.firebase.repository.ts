import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateEmail } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Usuario } from '../../domain/entities/usuario.entity';
import { CriarUsuarioInput, UsuarioRepository } from '../../domain/repositories/usuario.repository';

@Injectable()
export class UsuarioFirebaseRepository implements UsuarioRepository {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private collectionRef = collection(this.firestore, 'usuarios');

  listar(): Observable<Usuario[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<Usuario[]>;
  }

  obterPorId(id: string): Observable<Usuario | undefined> {
    const ref = doc(this.firestore, 'usuarios', id);
    return docData(ref, { idField: 'id' }).pipe(map(d => (d as Usuario) ?? undefined));
  }

  async criar(input: CriarUsuarioInput): Promise<string> {
    const cred = await createUserWithEmailAndPassword(this.auth, input.email, input.senha);
    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      nome: input.nome,
      email: input.email,
      cargo: input.cargo,
      ativo: input.ativo,
      createdAt: new Date(),
      createdBy: this.auth.currentUser?.uid || null
    });
    return cred.user.uid;
  }

  async atualizarPerfil(parcial: Partial<Usuario>): Promise<void> {
    const usuarioAtual = this.auth.currentUser;
    if (!usuarioAtual?.uid) throw new Error('Usuário não autenticado');

    if (parcial.email && parcial.email !== usuarioAtual.email) {
      await updateEmail(usuarioAtual, parcial.email);
    }
    const ref = doc(this.firestore, 'usuarios', usuarioAtual.uid);
    const { id, ...resto } = parcial as any;
    await setDoc(ref, resto, { merge: true });
  }

  async atualizarPorId(id: string, parcial: Partial<Usuario>): Promise<void> {
    const ref = doc(this.firestore, 'usuarios', id);
    await updateDoc(ref, { ...parcial, updatedAt: new Date() });
  }

  async setAtivo(id: string, ativo: boolean): Promise<void> {
    const ref = doc(this.firestore, 'usuarios', id);
    await updateDoc(ref, { ativo, updatedAt: new Date() });
  }
}