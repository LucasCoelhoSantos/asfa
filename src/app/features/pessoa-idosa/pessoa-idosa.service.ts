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

export interface ResultadoPaginacao {
  pessoas: PessoaIdosa[];
  ultimoDocumento: DocumentSnapshot | null;
  total: number;
  temMais: boolean;
}

@Injectable({ providedIn: 'root' })
export class PessoaIdosaService {
  private firestore = inject(Firestore);
  private collectionName = 'pessoasIdosas';
  private collectionRef = collection(this.firestore, this.collectionName);

  private cache = new Map<string, PessoaIdosa>();
  private pessoasSubject = new BehaviorSubject<ResultadoPaginacao>({ pessoas: [], ultimoDocumento: null, total: 0, temMais: false });
  public readonly pessoas$ = this.pessoasSubject.asObservable();

  obterTodos(): Observable<PessoaIdosa[]> {
    const consulta = query(this.collectionRef, where('ativo', '==', true), orderBy('nome'));
    return collectionData(consulta, { idField: 'id' }) as Observable<PessoaIdosa[]>;
  }

  obterPorId(id: string): Observable<PessoaIdosa | undefined> {
    const referenciaDocumento = doc(this.firestore, this.collectionName, id);
    return docData(referenciaDocumento).pipe(
      map(documento => {
        if (documento) {
          const pessoa = this.converterParaPessoaIdosa({ data: () => documento, id });
          this.cache.set(id, pessoa);
          return pessoa;
        }
        return undefined;
      })
    );
  }

  criar(pessoa: PessoaIdosa): Observable<string> {
    return from(addDoc(this.collectionRef, pessoa)).pipe(
      map(referenciaDocumento => {
        this.cache.clear();
        return referenciaDocumento.id;
      })
    );
  }

  atualizar(id: string, pessoa: Partial<PessoaIdosa>): Observable<void> {
    const referenciaDocumento = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(referenciaDocumento, pessoa)).pipe(
      map(() => {
        this.cache.delete(id);
      })
    );
  }

  inativar(id: string): Observable<void> {
    return this.atualizarStatus(id, false);
  }

  ativar(id: string): Observable<void> {
    return this.atualizarStatus(id, true);
  }

  private atualizarStatus(id: string, ativo: boolean): Observable<void> {
    const referenciaDocumento = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(referenciaDocumento, { ativo })).pipe(
      map(() => {
        this.cache.delete(id);
      })
    );
  }

  aplicarFiltros(filtros: FiltrosPessoaIdosa): void {
    this.obterPaginado(20, null, filtros).then(resultado => {
      this.pessoasSubject.next(resultado);
    });
  }

  definirPaginacao(tamanhoPagina: number, ultimoDocumento: DocumentSnapshot | null = null): void {
    this.obterPaginado(tamanhoPagina, ultimoDocumento, {}).then(resultado => {
      this.pessoasSubject.next(resultado);
    });
  }

  private converterParaPessoaIdosa(documento: any): PessoaIdosa {
    const dados = documento.data();
    
    return {
      id: documento.id,
      dataCadastro: this.converterData(dados.dataCadastro),
      nome: dados.nome || '',
      dataNascimento: this.converterData(dados.dataNascimento),
      ativo: dados.ativo ?? true,
      estadoCivil: dados.estadoCivil || '',
      cpf: dados.cpf || '',
      rg: dados.rg || '',
      orgaoEmissor: dados.orgaoEmissor || '',
      religiao: dados.religiao || '',
      naturalidade: dados.naturalidade || '',
      telefone: dados.telefone || '',
      prontuarioSaude: dados.prontuarioSaude || '',
      aposentadoConsegueSeManterComSuaRenda: dados.aposentadoConsegueSeManterComSuaRenda ?? false,
      comoComplementa: dados.comoComplementa || '',
      beneficio: dados.beneficio || '',
      observacao: dados.observacao || '',
      historicoFamiliarSocial: dados.historicoFamiliarSocial || '',
      composicaoFamiliar: dados.composicaoFamiliar || {},
      endereco: dados.endereco || {},
      dependentes: dados.dependentes || [],
      anexos: dados.anexos || []
    };
  }

  private converterData(campoData: any): Date {
    if (!campoData) return new Date();
    
    if (campoData instanceof Date) return campoData;
    
    if (campoData && typeof campoData.toDate === 'function') {
      return campoData.toDate();
    }
    
    if (typeof campoData === 'string') {
      const dataConvertida = new Date(campoData);
      return isNaN(dataConvertida.getTime()) ? new Date() : dataConvertida;
    }
    
    if (typeof campoData === 'number') {
      return new Date(campoData);
    }
    
    return new Date();
  }

  private async obterPaginado(tamanhoPagina: number, ultimoDocumento: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): Promise<ResultadoPaginacao> {
    const restricoes = this.construirRestricoesConsulta(tamanhoPagina, ultimoDocumento, filtros);
    const consulta = query(this.collectionRef, ...restricoes);
    const snapshot = await getDocs(consulta);
    
    return this.processarResultadoConsulta(snapshot, tamanhoPagina);
  }

  private construirRestricoesConsulta(tamanhoPagina: number, ultimoDocumento: DocumentSnapshot | null, filtros: FiltrosPessoaIdosa): QueryConstraint[] {
    const restricoes: QueryConstraint[] = [
      orderBy('nome'),
      limit(tamanhoPagina + 1)
    ];

    if (filtros.ativo !== undefined) {
      restricoes.unshift(where('ativo', '==', filtros.ativo));
    }

    if (ultimoDocumento) {
      restricoes.push(startAfter(ultimoDocumento));
    }
    
    if (filtros.nome?.trim()) {
      restricoes.push(
        where('nome', '>=', filtros.nome),
        where('nome', '<=', filtros.nome + '\uf8ff')
      );
    }
    
    if (filtros.cpf?.trim()) {
      restricoes.push(where('cpf', '==', filtros.cpf));
    }
    
    if (filtros.estadoCivil?.trim()) {
      restricoes.push(where('estadoCivil', '==', filtros.estadoCivil));
    }

    return restricoes;
  }

  private processarResultadoConsulta(snapshot: any, tamanhoPagina: number): ResultadoPaginacao {
    const documentos = snapshot.docs;
    const temMais = documentos.length > tamanhoPagina;
    const pessoas = (temMais ? documentos.slice(0, tamanhoPagina) : documentos).map((documento: any) => this.converterParaPessoaIdosa(documento));

    return {
      pessoas,
      ultimoDocumento: documentos.length > 0 ? documentos[documentos.length - 1] : null,
      total: pessoas.length,
      temMais
    };
  }
}