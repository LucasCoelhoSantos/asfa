import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, where, query, limit, startAfter, getDocs, getCountFromServer, CollectionReference, DocumentData, Timestamp, collectionData, QueryConstraint } from '@angular/fire/firestore';
import { firstValueFrom, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PessoaIdosa } from '../../domains/pessoa-idosa/domain/entities/pessoa-idosa.entity';
import { PessoaIdosaRepository, PessoaIdosaFiltros, PessoaIdosaListaPaginada } from '../../domains/pessoa-idosa/domain/repositories/pessoa-idosa.repository';
import { MaskUtils } from '../../shared';
import { STORAGE_PORT, StoragePort } from '../../shared/ports/storage.port';
import { Anexo } from '../../domains/pessoa-idosa/domain/value-objects/anexo.vo';

@Injectable({ providedIn: 'root' })
export class PessoaIdosaFirestoreRepository implements PessoaIdosaRepository {
  private firestore: Firestore = inject(Firestore);
  private environmentInjector = inject(EnvironmentInjector);
  private storagePort = inject(STORAGE_PORT);
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

  obterTodos(): Observable<PessoaIdosa[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<PessoaIdosa[]>;
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

  obterPorId(id: string): Observable<PessoaIdosa | undefined> {
    return from(runInInjectionContext(this.environmentInjector, () => getDoc(doc(this.collectionRef, id)))).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          return undefined;
        }
        let dados = this.converterTimestampsParaDatas(snapshot.data());
        return PessoaIdosa.rehidratar({ ...dados, id: snapshot.id });
      })
    );
  }

  private async prepararAnexosParaSalvar(pessoaId: string, pessoa: PessoaIdosa): Promise<any[]> {
    const anexosOrigem: any[] = (pessoa as any).anexos || [];
    const resultados: any[] = [];
    for (const anexo of anexosOrigem) {
      const base = typeof anexo?.toJSON === 'function' ? anexo.toJSON() : anexo;
      if (base?.file) {
        const arquivo: File = base.file;
        const timestamp = Date.now();
        const safeName = arquivo.name.replace(/\s+/g, '-');
        const path = `pessoas-idosas/${pessoaId}/${base.categoria}/${timestamp}-${safeName}`;
        const upload = await firstValueFrom(this.storagePort.upload(arquivo, path));
        resultados.push(Anexo.criar({ categoria: base.categoria, url: upload.url, path: upload.path }).toJSON());
      } else if (base?.url && base?.path) {
        resultados.push({ categoria: base.categoria, url: base.url, path: base.path });
      }
    }
    return resultados;
  }

  criar(pessoa: PessoaIdosa): Observable<string> {
    return from((async () => {
      const docRef = doc(this.collectionRef);
      const pessoaId = docRef.id;
      const dados = pessoa.toJSON();
      const { id: _ignore, anexos: _anexosIgnorados, ...resto } = dados as any;
      const anexos = await this.prepararAnexosParaSalvar(pessoaId, pessoa);
      await setDoc(docRef, { ...resto, anexos });
      return pessoaId;
    })());
  }

  atualizar(pessoa: PessoaIdosa): Observable<void> {
    return from((async () => {
      const pessoaId = pessoa.id;
      const dados = pessoa.toJSON();
      const { id: _ignore, anexos: _anexosIgnorados, ...resto } = dados as any;
      const anexos = await this.prepararAnexosParaSalvar(pessoaId, pessoa);
      await setDoc(doc(this.collectionRef, pessoaId), { ...resto, anexos });
    })());
  }
}