import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, query, where, orderBy, limit, startAfter, QueryConstraint, getDocs, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
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

  /**
   * Observable reativo das pessoas idosas com filtros aplicados
   */
  pessoas$: Observable<PaginacaoResult> | null = null;

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
   * Ativa uma pessoa idosa
   */
  ativar(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(docRef, { ativo: true })).pipe(
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
    // Cria um novo observable com os filtros aplicados
    this.pessoas$ = from(this.getPaginated(20, null, filtros));
  }

  /**
   * Define paginação
   */
  setPaginacao(pageSize: number, lastDoc: DocumentSnapshot | null = null): void {
    // Se já temos um observable de pessoas, atualiza com nova paginação
    if (this.pessoas$) {
      this.pessoas$ = from(this.getPaginated(pageSize, lastDoc, {}));
    }
  }

  /**
   * Converte dados do Firestore para PessoaIdosa
   */
  private convertToPessoaIdosa(doc: any): PessoaIdosa {
    const data = doc.data();
    
    // Função auxiliar para converter data
    const converterData = (dataField: any, fieldName: string): Date => {
      if (!dataField) return new Date();
      
      // Se já é uma Date
      if (dataField instanceof Date) return dataField;
      
      // Se é um Firebase Timestamp
      if (dataField && typeof dataField.toDate === 'function') {
        return dataField.toDate();
      }
      
      // Se é uma string de data
      if (typeof dataField === 'string') {
        const parsed = new Date(dataField);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }
      
      // Se é um timestamp numérico
      if (typeof dataField === 'number') {
        return new Date(dataField);
      }
      
      return new Date();
    };

    return {
      id: doc.id,
      dataCadastro: converterData(data.dataCadastro, 'dataCadastro'),
      nome: data.nome || '',
      dataNascimento: converterData(data.dataNascimento, 'dataNascimento'),
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

  /**
   * Busca paginada real no Firestore, com filtros otimizados
   */
  private async getPaginated(pageSize: number, lastDoc: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): Promise<PaginacaoResult> {
    
    // Se não há filtros específicos, busca todos os registros
    if (!filtros.nome && !filtros.cpf && !filtros.estadoCivil && filtros.ativo === undefined) {
      const q = query(this.collectionRef, orderBy('nome'), limit(pageSize + 1));
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
    
    const constraints: QueryConstraint[] = [
      orderBy('nome'),
      limit(pageSize + 1) // +1 para verificar se há mais páginas
    ];

    // Aplica filtro de ativo apenas se especificado
    if (filtros.ativo !== undefined) {
      constraints.unshift(where('ativo', '==', filtros.ativo));
    }

    if (lastDoc) constraints.push(startAfter(lastDoc));
    
    // Aplica filtros de forma otimizada
    if (filtros.nome && filtros.nome.trim()) {
      constraints.push(
        where('nome', '>=', filtros.nome),
        where('nome', '<=', filtros.nome + '\uf8ff')
      );
    }
    if (filtros.cpf && filtros.cpf.trim()) constraints.push(where('cpf', '==', filtros.cpf));
    if (filtros.estadoCivil && filtros.estadoCivil.trim()) constraints.push(where('estadoCivil', '==', filtros.estadoCivil));

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
   * Método de teste para verificar dados na coleção
   */
  testarConexao(): Observable<any> {
    const q = query(this.collectionRef, limit(5));
    return from(getDocs(q)).pipe(
      map(snap => {
        snap.docs.forEach((doc, index) => {
        });
        return snap;
      })
    );
  }

  /**
   * Limpa cache local
   */
  limparCache(): void {
    this.cache.clear();
  }
}