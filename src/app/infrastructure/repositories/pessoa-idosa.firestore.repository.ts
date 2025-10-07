import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, where, addDoc, query, limit, startAfter, getDocs, getCountFromServer, CollectionReference, DocumentData, Timestamp, collectionData, QueryConstraint } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PessoaIdosa } from '../../domains/pessoa-idosa/domain/entities/pessoa-idosa.entity';
import { PessoaIdosaRepository, PessoaIdosaFiltros, PessoaIdosaListaPaginada } from '../../domains/pessoa-idosa/domain/repositories/pessoa-idosa.repository';
import { MaskUtils } from '../../shared';

@Injectable({ providedIn: 'root' })
export class PessoaIdosaFirestoreRepository implements PessoaIdosaRepository {
  private firestore: Firestore = inject(Firestore);
  private collectionRef: CollectionReference<DocumentData>;

  constructor() {
    this.collectionRef = collection(this.firestore, 'pessoas-idosas');
  }

  private converterTimestampsParaDatas(data: any): any {
    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        data[key] = data[key].toDate();
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        this.converterTimestampsParaDatas(data[key]);
      }
    }
    return data;
  }

  obterTodos(filtros?: PessoaIdosaFiltros): Observable<PessoaIdosa[]> {
    const q: QueryConstraint[] = [];

    if (filtros) {
      if (filtros.nome) {
        q.push(where('nome', '>=', filtros.nome));
        q.push(where('nome', '<=', filtros.nome + '\uf8ff'));
      }
      if (filtros.cpf) {
        q.push(where('cpf', '==', MaskUtils.removeMascara(filtros.cpf)));
      }
      if (filtros.rg) {
        q.push(where('rg', '==', MaskUtils.removeMascara(filtros.rg)));
      }
      if (filtros.cep) {
          q.push(where('endereco.cep', '==', MaskUtils.removeMascara(filtros.cep)));
      }
      if (filtros.dataNascimento) {
          q.push(where('dataNascimento', '==', filtros.dataNascimento));
      }
      if (filtros.estadoCivil) {
          q.push(where('estadoCivil', '==', filtros.estadoCivil));
      }
      if (filtros.beneficio) {
          q.push(where('beneficio', '==', filtros.beneficio));
      }
      if (filtros.situacaoOcupacional) {
          q.push(where('situacaoOcupacional', '==', filtros.situacaoOcupacional));
      }
      if (filtros.problemaDeSaude) {
          q.push(where('problemaDeSaude', '==', filtros.problemaDeSaude));
      }
      if (filtros.aposentado) {
          q.push(where('aposentado', '==', filtros.aposentado));
      }
      if (filtros.moradia) {
          q.push(where('endereco.moradia', '==', filtros.moradia));
      }
      if (filtros.deficiencia) {
          q.push(where('deficiencia', '==', filtros.deficiencia));
      }
      if (filtros.nivelSerieAtual) {
          q.push(where('nivelSerieAtual', '==', filtros.nivelSerieAtual));
      }
      if (filtros.cursoFormacao) {
        q.push(where('cursoFormacao', '==', filtros.cursoFormacao));
      }
      if (filtros.alfabetizado !== undefined && filtros.alfabetizado !== null) {
        q.push(where('alfabetizado', '==', filtros.alfabetizado));
      }
      if (filtros.estudaAtualmente !== undefined && filtros.estudaAtualmente !== null) {
        q.push(where('estudaAtualmente', '==', filtros.estudaAtualmente));
      }
      if (filtros.ativo) {
        q.push(where('ativo', '==', filtros.ativo === 'ativo'));
      }
    }

    return collectionData(query(this.collectionRef, ...q), { idField: 'id' }) as Observable<PessoaIdosa[]>;
  }

  obterPorId(id: string): Observable<PessoaIdosa | undefined> {
    const docRef = doc(this.collectionRef, id);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          return undefined;
        }
        let dados = this.converterTimestampsParaDatas(snapshot.data());
        return PessoaIdosa.rehidratar({ ...dados, id: snapshot.id });
      })
    );
  }

  criar(pessoa: PessoaIdosa): Observable<string> {
    const dados = pessoa.toJSON();
    const { id, ...dataToSave } = dados;

    return from(addDoc(this.collectionRef, dataToSave)).pipe(
      map(docRef => docRef.id)
    );
  }

  atualizar(pessoa: PessoaIdosa): Observable<void> {
    const docRef = doc(this.collectionRef, pessoa.id);
    const dados = pessoa.toJSON();
    const { id, ...dataToUpdate } = dados;

    return from(setDoc(docRef, dataToUpdate));
  }

  async obterTodosPaginado(pagina: number, quantidadePorPagina: number, filtros?: PessoaIdosaFiltros): Promise<PessoaIdosaListaPaginada> {
    const constraints: QueryConstraint[] = [];
    if (filtros) {
      if (filtros.nome) {
        constraints.push(where('nome', '>=', filtros.nome));
        constraints.push(where('nome', '<=', filtros.nome + '\uf8ff'));
      }
      if (filtros.cpf) {
        constraints.push(where('cpf', '==', MaskUtils.removeMascara(filtros.cpf)));
      }
      if (filtros.rg) {
        constraints.push(where('rg', '==', MaskUtils.removeMascara(filtros.rg)));
      }
      if (filtros.cep) {
        constraints.push(where('endereco.cep', '==', MaskUtils.removeMascara(filtros.cep)));
      }
      if (filtros.dataNascimento) {
        constraints.push(where('dataNascimento', '==', filtros.dataNascimento));
      }
      if (filtros.estadoCivil) {
        constraints.push(where('estadoCivil', '==', filtros.estadoCivil));
      }
      if (filtros.beneficio) {
        constraints.push(where('beneficio', '==', filtros.beneficio));
      }
      if (filtros.situacaoOcupacional) {
        constraints.push(where('situacaoOcupacional', '==', filtros.situacaoOcupacional));
      }
      if (filtros.problemaDeSaude) {
        constraints.push(where('problemaDeSaude', '==', filtros.problemaDeSaude));
      }
      if (filtros.aposentado) {
        constraints.push(where('aposentado', '==', filtros.aposentado));
      }
      if (filtros.moradia) {
        constraints.push(where('endereco.moradia', '==', filtros.moradia));
      }
      if (filtros.deficiencia) {
        constraints.push(where('deficiencia', '==', filtros.deficiencia));
      }
      if (filtros.nivelSerieAtual) {
        constraints.push(where('nivelSerieAtual', '==', filtros.nivelSerieAtual));
      }
      if (filtros.cursoFormacao) {
        constraints.push(where('cursoFormacao', '==', filtros.cursoFormacao));
      }
      if (filtros.alfabetizado !== undefined && filtros.alfabetizado !== null) {
        constraints.push(where('alfabetizado', '==', filtros.alfabetizado));
      }
      if (filtros.estudaAtualmente !== undefined && filtros.estudaAtualmente !== null) {
        constraints.push(where('estudaAtualmente', '==', filtros.estudaAtualmente));
      }
      if (filtros.ativo) {
        constraints.push(where('ativo', '==', filtros.ativo === 'ativo'));
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

    const pessoas = querySnapshot.docs.map(doc => {
      let dados = this.converterTimestampsParaDatas(doc.data());
      return PessoaIdosa.rehidratar({ ...dados, id: doc.id });
    });

    return {
      pessoasIdosas: pessoas,
      paginaAtual: pagina,
      quantidadePorPagina,
      total: countSnapshot.data().count,
    };
  }
}