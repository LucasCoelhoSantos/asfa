import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, getDocs, setDoc, updateDoc, query, where, CollectionReference, DocumentData, limit, startAfter, getCountFromServer } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../../domains/usuario/domain/entities/usuario.entity';
import { UsuarioRepository, UsuarioListFiltros, UsuarioListaPaginada } from '../../domains/usuario/domain/repositories/usuario.repository';

@Injectable({ providedIn: 'root' })
export class UsuarioFirebaseRepository implements UsuarioRepository {
	private firestore: Firestore = inject(Firestore);
	private environmentInjector = inject(EnvironmentInjector);
	private collectionRef: CollectionReference<DocumentData>;

	constructor() {
		this.collectionRef = collection(this.firestore, 'usuarios');
	}

  obterTodos(): Observable<Usuario[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<Usuario[]>;
	}

	obterPorId(id: string): Observable<Usuario | undefined> {
		return from(runInInjectionContext(this.environmentInjector, () => getDoc(doc(this.collectionRef, id)))).pipe(
			map(snapshot => {
				if (!snapshot.exists()) {
					return undefined;
				}
				const dados = snapshot.data();
				return Usuario.rehidratar({ ...dados, id: snapshot.id } as any);
			})
		);
	}

	obterPorEmail(email: string): Observable<Usuario | undefined> {
		const q = query(this.collectionRef, where('email', '==', email));
		return from(getDocs(q)).pipe(
			map(querySnapshot => {
				if (querySnapshot.empty) {
					return undefined;
				}
				const doc = querySnapshot.docs[0];
				const dados = doc.data();
				return Usuario.rehidratar({ ...dados, id: doc.id } as any);
			})
		);
	}

  async obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: UsuarioListFiltros): Promise<UsuarioListaPaginada> {
    const constraints: any[] = [];
    if (filtros) {
      if (filtros.nome) {
        constraints.push(where('nome', '>=', filtros.nome));
        constraints.push(where('nome', '<=', filtros.nome + '\uf8ff'));
      }
      if (filtros.email) {
        constraints.push(where('email', '>=', filtros.email));
        constraints.push(where('email', '<=', filtros.email + '\uf8ff'));
      }
      if (typeof filtros.ativo === 'boolean') {
        constraints.push(where('ativo', '==', filtros.ativo));
      }
      if (typeof filtros.cargo !== 'undefined' && filtros.cargo !== null && filtros.cargo !== ('' as any)) {
        constraints.push(where('cargo', '==', filtros.cargo));
      }
    }

    const tamanho = quantidadePorPagina;
    const baseQuery = query(this.collectionRef, ...constraints, limit(tamanho));

    let q = baseQuery;
    if (pagina > 1) {
      let lastDoc: any = null;
      for (let i = 1; i < pagina; i++) {
        const snap = await getDocs(q);
        if (snap.docs.length === 0) break;
        lastDoc = snap.docs[snap.docs.length - 1];
        q = query(this.collectionRef, ...constraints, startAfter(lastDoc), limit(tamanho));
      }
    }

    const querySnapshot = await getDocs(q);
    const countSnapshot = await getCountFromServer(query(this.collectionRef, ...constraints));

    const usuarios = querySnapshot.docs.map(doc => {
      const dados = doc.data();
      return Usuario.rehidratar({ ...dados, id: doc.id } as any);
    });

    return {
      usuarios,
      paginaAtual: pagina,
      quantidadePorPagina,
      total: countSnapshot.data().count,
    };
  }

	criar(usuario: Usuario): Observable<string> {
		const docRef = doc(this.collectionRef);
		const dados = usuario.toJSON();
		const { id, ...dadosParaSalvar } = dados;
		
		console.log(docRef, dados, dadosParaSalvar);
		return from(setDoc(docRef, dadosParaSalvar)).pipe(map(() => docRef.id));
	}

	atualizar(usuario: Usuario): Observable<void> {
		const dados = usuario.toJSON();
		const { id, ...dadosParaAtualizar } = dados;

		return from(updateDoc(doc(this.collectionRef, usuario.id), dadosParaAtualizar));
	}
}