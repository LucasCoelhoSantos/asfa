import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, query, where, orderBy, limit, startAfter, QueryConstraint, getDocs, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';

export interface FiltrosPessoaIdosa {
  nome?: string;
  cpf?: string;
  estadoCivil?: string;
  ativo?: boolean;
  dataNascimento?: string;
  rg?: string;
  cep?: string;
}

export interface PaginacaoResult {
  pessoas: PessoaIdosa[];
  lastDoc: DocumentSnapshot | null;
  total: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class PessoaIdosaService {
  private firestore = inject(Firestore);
  private collectionName = 'pessoasIdosas';
  private collectionRef = collection(this.firestore, this.collectionName);

  private cache = new Map<string, PessoaIdosa>();
  private pessoasSubject = new BehaviorSubject<PaginacaoResult>({ pessoas: [], lastDoc: null, total: 0, hasMore: false });
  pessoas$ = this.pessoasSubject.asObservable();

  getAll(): Observable<PessoaIdosa[]> {
    const q = query(this.collectionRef, where('ativo', '==', true), orderBy('nome'));
    return collectionData(q, { idField: 'id' }) as Observable<PessoaIdosa[]>;
  }

  getById(id: string): Observable<PessoaIdosa | undefined> {
    if (this.cache.has(id)) {
      return from(Promise.resolve(this.cache.get(id)));
    }

    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef).pipe(
      map(doc => {
        if (doc) {
          const pessoa = this.convertToPessoaIdosa({ data: () => doc, id });
          this.cache.set(id, pessoa);
          return pessoa;
        }
        return undefined;
      })
    );
  }

  create(pessoa: PessoaIdosa): Observable<string> {
    return from(addDoc(this.collectionRef, pessoa)).pipe(
      map(docRef => {
        this.cache.clear();
        return docRef.id;
      })
    );
  }

  update(id: string, pessoa: Partial<PessoaIdosa>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, pessoa)).pipe(
      map(() => {
        this.cache.delete(id);
      })
    );
  }

  inativar(id: string): Observable<void> {
    return this.updateStatus(id, false);
  }

  ativar(id: string): Observable<void> {
    return this.updateStatus(id, true);
  }

  private updateStatus(id: string, ativo: boolean): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, { ativo })).pipe(
      map(() => {
        this.cache.delete(id);
      })
    );
  }

  aplicarFiltros(filtros: FiltrosPessoaIdosa): void {
    this.getPaginated(20, null, filtros).then(result => {
      this.pessoasSubject.next(result);
    });
  }

  setPaginacao(pageSize: number, lastDoc: DocumentSnapshot | null = null): void {
    this.getPaginated(pageSize, lastDoc, {}).then(result => {
      this.pessoasSubject.next(result);
    });
  }

  private convertToPessoaIdosa(doc: any): PessoaIdosa {
    const data = doc.data();
    
    return {
      id: doc.id,
      dataCadastro: this.convertDate(data.dataCadastro),
      nome: data.nome || '',
      dataNascimento: this.convertDate(data.dataNascimento),
      ativo: data.ativo ?? true,
      estadoCivil: data.estadoCivil || '',
      cpf: data.cpf || '',
      rg: data.rg || '',
      orgaoEmissor: data.orgaoEmissor || '',
      religiao: data.religiao || '',
      naturalidade: data.naturalidade || '',
      telefone: data.telefone || '',
      prontuarioSaude: data.prontuarioSaude || '',
      aposentadoConsegueSeManterComSuaRenda: data.aposentadoConsegueSeManterComSuaRenda ?? false,
      comoComplementa: data.comoComplementa || '',
      beneficio: data.beneficio || '',
      observacao: data.observacao || '',
      historicoFamiliarSocial: data.historicoFamiliarSocial || '',
      composicaoFamiliar: data.composicaoFamiliar || {},
      endereco: data.endereco || {},
      dependentes: data.dependentes || [],
      anexos: data.anexos || []
    };
  }

  private convertDate(dataField: any): Date {
    if (!dataField) return new Date();
    
    if (dataField instanceof Date) return dataField;
    
    if (dataField && typeof dataField.toDate === 'function') {
      return dataField.toDate();
    }
    
    if (typeof dataField === 'string') {
      const parsed = new Date(dataField);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    if (typeof dataField === 'number') {
      return new Date(dataField);
    }
    
    return new Date();
  }

  private async getPaginated(pageSize: number, lastDoc: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): Promise<PaginacaoResult> {
    const constraints = this.buildQueryConstraints(pageSize, lastDoc, filtros);
    const q = query(this.collectionRef, ...constraints);
    const snap = await getDocs(q);
    
    return this.processQueryResult(snap, pageSize);
  }

  private buildQueryConstraints(pageSize: number, lastDoc: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): QueryConstraint[] {
    const constraints: QueryConstraint[] = [
      orderBy('nome'),
      limit(pageSize + 1)
    ];

    if (filtros.ativo !== undefined) {
      constraints.unshift(where('ativo', '==', filtros.ativo));
    }

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    if (filtros.nome?.trim()) {
      constraints.push(
        where('nome', '>=', filtros.nome),
        where('nome', '<=', filtros.nome + '\uf8ff')
      );
    }
    
    if (filtros.cpf?.trim()) {
      constraints.push(where('cpf', '==', filtros.cpf));
    }
    
    if (filtros.estadoCivil?.trim()) {
      constraints.push(where('estadoCivil', '==', filtros.estadoCivil));
    }

    return constraints;
  }

  private processQueryResult(snap: any, pageSize: number): PaginacaoResult {
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const pessoas = (hasMore ? docs.slice(0, pageSize) : docs).map((d: any) => this.convertToPessoaIdosa(d));

    return {
      pessoas,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      total: pessoas.length,
      hasMore
    };
  }
}