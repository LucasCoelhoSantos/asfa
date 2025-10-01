import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, query, where, orderBy, QueryConstraint, limit, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs';
import { Usuario } from '../../domains/usuario/domain/entities/usuario.entity';
import { UsuarioListFilters, UsuarioRepository } from '../../domains/usuario/domain/repositories/usuario.repository';

@Injectable()
export class UsuarioFirebaseRepository implements UsuarioRepository {
  private firestore = inject(Firestore);
  private readonly collectionName = 'usuarios';
  private readonly collectionRef = collection(this.firestore, this.collectionName);

  listar(filtros: UsuarioListFilters = {}): Observable<Usuario[]> {
    const restricoes: QueryConstraint[] = [orderBy('nome')];

    if (typeof filtros.ativo === 'boolean') {
      restricoes.unshift(where('ativo', '==', filtros.ativo));
    }
    if (filtros.nome?.trim()) {
      restricoes.push(where('nome', '>=', filtros.nome), where('nome', '<=', filtros.nome + '\uf8ff'));
    }
    if (filtros.email?.trim()) {
      restricoes.push(where('email', '==', filtros.email));
    }

    const consulta = query(this.collectionRef, ...restricoes);
    return collectionData(consulta, { idField: 'id' }).pipe(map(dados => dados.map(dado => this.converterParaUsuario(dado.id, dado))));
  }

  obterPorId(id: string): Observable<Usuario | undefined> {
    const ref = doc(this.firestore, this.collectionName, id);
    return docData(ref).pipe(map(data => {
      if(!data) return undefined;
      return this.converterParaUsuario(id, data);
    }));
  }

  obterPorEmail(email: string): Observable<Usuario | undefined> {
    const consulta = query(this.collectionRef, where('email', '==', email), limit(1));

    return from(getDocs(consulta)).pipe(
      map(snapshot => {
        if (snapshot.empty) return undefined;
        const doc = snapshot.docs[0];
        return this.converterParaUsuario(doc.id, doc.data());
      })
    )
  }

  criar(usuario: Usuario): Observable<string> {
    const docRef = doc(this.firestore, this.collectionName, usuario.id);
    const dados = usuario.toJSON();
    delete (dados as any).id;
    return from(setDoc(docRef, dados)).pipe(map(() => usuario.id));
  }

  atualizar(usuario: Usuario): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, usuario.id);
    const dados = usuario.toJSON();
    delete (dados as any).id;
    return from(updateDoc(docRef, { ...dados }));
  }

  private converterParaUsuario(id: string, data: any): Usuario {
    return Usuario.criar({
      id: id,
      nome: data.nome,
      email: data.email,
      cargo: data.cargo,
      ativo: data.ativo
    });
  }
}