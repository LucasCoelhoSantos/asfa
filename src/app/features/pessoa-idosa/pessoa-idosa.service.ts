import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, query, where, orderBy, limit, startAfter, QueryConstraint, getDocs, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject, combineLatest, map, switchMap, distinctUntilChanged, debounceTime, of } from 'rxjs';
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

/**
 * Serviço para CRUD de Pessoas Idosas usando Firestore com otimizações de performance.
 * Implementa cache local, paginação eficiente e filtros reativos.
 */
@Injectable({ providedIn: 'root' })
export class PessoaIdosaService {
  private firestore = inject(Firestore);
  private collectionName = 'pessoasIdosas';
  private collectionRef = collection(this.firestore, this.collectionName);

  // Cache local para melhorar performance
  private cache = new Map<string, PessoaIdosa>();
  private filtrosSubject = new BehaviorSubject<FiltrosPessoaIdosa>({});
  private paginacaoSubject = new BehaviorSubject<{ pageSize: number; lastDoc: DocumentSnapshot | null }>({
    pageSize: 20,
    lastDoc: null
  });

  /**
   * Observable reativo das pessoas idosas com filtros aplicados
   */
  pessoas$ = combineLatest([
    this.filtrosSubject.asObservable().pipe(debounceTime(300), distinctUntilChanged()),
    this.paginacaoSubject.asObservable()
  ]).pipe(
    switchMap(([filtros, paginacao]) => this.getPaginatedObservable(paginacao.pageSize, paginacao.lastDoc, filtros))
  );

  /**
   * Retorna todas as pessoas idosas ativas (ativo=true) - versão otimizada
   */
  getAll(): Observable<PessoaIdosa[]> {
    const q = query(this.collectionRef, where('ativo', '==', true), orderBy('nome'));
    return collectionData(q, { idField: 'id' }) as Observable<PessoaIdosa[]>;
  }

  /**
   * Busca uma pessoa idosa por ID
   */
  getById(id: string): Observable<PessoaIdosa | undefined> {
    // Verifica cache primeiro
    if (this.cache.has(id)) {
      return of(this.cache.get(id));
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

  /**
   * Cria uma nova pessoa idosa
   */
  create(pessoa: PessoaIdosa): Observable<string> {
    return from(addDoc(this.collectionRef, pessoa)).pipe(
      map(docRef => {
        // Limpa cache para forçar refresh
        this.cache.clear();
        return docRef.id;
      })
    );
  }

  /**
   * Atualiza uma pessoa idosa existente
   */
  update(id: string, pessoa: Partial<PessoaIdosa>): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, pessoa)).pipe(
      map(() => {
        // Remove do cache para forçar refresh
        this.cache.delete(id);
      })
    );
  }

  /**
   * Inativa (soft delete) uma pessoa idosa
   */
  inativar(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, { ativo: false })).pipe(
      map(() => {
        // Remove do cache para forçar refresh
        this.cache.delete(id);
      })
    );
  }

  /**
   * Aplica filtros de forma reativa
   */
  aplicarFiltros(filtros: FiltrosPessoaIdosa): void {
    this.filtrosSubject.next(filtros);
  }

  /**
   * Define paginação
   */
  setPaginacao(pageSize: number, lastDoc: DocumentSnapshot | null = null): void {
    this.paginacaoSubject.next({ pageSize, lastDoc });
  }

  /**
   * Busca paginada otimizada com observables
   */
  private getPaginatedObservable(pageSize: number, lastDoc: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): Observable<PaginacaoResult> {
    return from(this.getPaginated(pageSize, lastDoc, filtros));
  }

  /**
   * Converte dados do Firestore para PessoaIdosa
   */
  private convertToPessoaIdosa(doc: any): PessoaIdosa {
    const data = doc.data();
    return {
      id: doc.id,
      dataCadastro: data.dataCadastro?.toDate() || new Date(),
      nome: data.nome || '',
      dataNascimento: data.dataNascimento?.toDate() || new Date(),
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
      observacao: data.observacao || '',
      historicoFamiliarSocial: data.historicoFamiliarSocial || '',
      composicaoFamiliar: data.composicaoFamiliar || {},
      endereco: data.endereco || {},
      dependentes: data.dependentes || [],
      anexos: data.anexos || []
    };
  }

  /**
   * Busca paginada real no Firestore, com filtros otimizados
   */
  private async getPaginated(pageSize: number, lastDoc: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): Promise<PaginacaoResult> {
    const constraints: QueryConstraint[] = [
      where('ativo', '==', true),
      orderBy('nome'),
      limit(pageSize + 1) // +1 para verificar se há mais páginas
    ];

    if (lastDoc) constraints.push(startAfter(lastDoc));
    
    // Aplica filtros de forma otimizada
    if (filtros.nome) {
      constraints.push(
        where('nome', '>=', filtros.nome),
        where('nome', '<=', filtros.nome + '\uf8ff')
      );
    }
    if (filtros.cpf) constraints.push(where('cpf', '==', filtros.cpf));
    if (filtros.estadoCivil) constraints.push(where('estadoCivil', '==', filtros.estadoCivil));

    const q = query(this.collectionRef, ...constraints);
    const snap = await getDocs(q);
    
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const pessoas = (hasMore ? docs.slice(0, pageSize) : docs).map(d => this.convertToPessoaIdosa(d));

    return {
      pessoas,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      total: pessoas.length,
      hasMore
    };
  }

  /**
   * Limpa cache local
   */
  limparCache(): void {
    this.cache.clear();
  }
}