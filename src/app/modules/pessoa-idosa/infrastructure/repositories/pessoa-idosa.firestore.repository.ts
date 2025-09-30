import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, query, where, orderBy, limit, startAfter, getDocs, QueryConstraint, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Endereco } from '../../domain/value-objects/endereco.vo';
import { ComposicaoFamiliar } from '../../domain/value-objects/composicao-familiar.vo';
import { Anexo } from '../../domain/value-objects/anexo.vo';
import { PessoaIdosa } from '../../domain/entities/pessoa-idosa.entity';
import { PessoaIdosaRepository, PessoaIdosaListFilters, PessoaIdosaListPage } from '../../domain/repositories/pessoa-idosa.repository';

@Injectable()
export class PessoaIdosaFirestoreRepository implements PessoaIdosaRepository {
  private firestore = inject(Firestore);
  private readonly collectionName = 'pessoasIdosas';
  private readonly collectionRef = collection(this.firestore, this.collectionName);

  listar(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]> {
    const restricoes: QueryConstraint[] = [orderBy('nome')];
    if (typeof filtros.ativo === 'boolean') {
      restricoes.unshift(where('ativo', '==', filtros.ativo));
    }
    if (filtros.nome?.trim()) {
      restricoes.push(where('nome', '>=', filtros.nome), where('nome', '<=', filtros.nome + '\uf8ff'));
    }
    if (filtros.cpf?.trim()) {
      restricoes.push(where('cpf', '==', filtros.cpf));
    }
    const consulta = query(this.collectionRef, ...restricoes);
    return collectionData(consulta, { idField: 'id' }).pipe(map((itens: any[]) => itens.map(d => this.converterParaPessoaIdosa({ data: () => d, id: d.id }))));
  }

  obterPorId(id: string): Observable<PessoaIdosa | undefined> {
    const referenciaDocumento = doc(this.firestore, this.collectionName, id);
    return docData(referenciaDocumento).pipe(map(documento => documento ? this.converterParaPessoaIdosa({ data: () => documento, id }) : undefined));
  }

  criar(pessoa: PessoaIdosa): Observable<string> {
    return from(addDoc(this.collectionRef, pessoa)).pipe(map(ref => ref.id));
  }

  atualizar(id: string, pessoa: Partial<PessoaIdosa>): Observable<void> {
    const referenciaDocumento = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(referenciaDocumento, pessoa)).pipe(map(() => void 0));
  }

  ativar(id: string): Observable<void> {
    return this.atualizar(id, { ativo: true });
  }

  inativar(id: string): Observable<void> {
    return this.atualizar(id, { ativo: false });
  }

  async paginar(tamanho: number, cursor: DocumentSnapshot | null, filtros: PessoaIdosaListFilters): Promise<PessoaIdosaListPage> {
    const restricoes = this.construirRestricoesConsulta(tamanho, cursor, filtros);
    const consulta = query(this.collectionRef, ...restricoes);
    const snapshot = await getDocs(consulta);
    const documentos = snapshot.docs;
    const temMais = documentos.length > tamanho;
    const pessoas = (temMais ? documentos.slice(0, tamanho) : documentos).map((documento: any) => this.converterParaPessoaIdosa(documento));
    return { pessoas, cursor: documentos.length > 0 ? documentos[documentos.length - 1] : null, total: pessoas.length, temMais };
  }

  private construirRestricoesConsulta(tamanho: number, cursor: DocumentSnapshot | null, filtros: PessoaIdosaListFilters): QueryConstraint[] {
    const restricoes: QueryConstraint[] = [orderBy('nome'), limit(tamanho + 1)];
    if (typeof filtros.ativo === 'boolean') {
      restricoes.unshift(where('ativo', '==', filtros.ativo));
    }
    if (cursor) {
      restricoes.push(startAfter(cursor));
    }
    if (filtros.nome?.trim()) {
      restricoes.push(where('nome', '>=', filtros.nome), where('nome', '<=', filtros.nome + '\uf8ff'));
    }
    if (filtros.cpf?.trim()) {
      restricoes.push(where('cpf', '==', filtros.cpf));
    }
    if (filtros.estadoCivil?.trim()) {
      restricoes.push(where('estadoCivil', '==', filtros.estadoCivil));
    }
    return restricoes;
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
      composicaoFamiliar: dados.composicaoFamiliar ? ComposicaoFamiliar.criar(dados.composicaoFamiliar) : ComposicaoFamiliar.criar({}),
      endereco: dados.endereco ? Endereco.criar(dados.endereco) : Endereco.criar({ cep: '', moradia: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }),
      dependentes: dados.dependentes || [],
      anexos: Array.isArray(dados.anexos) ? dados.anexos.map((a: any) => Anexo.criar(a)) : []
    };
  }

  private converterData(campoData: any): Date {
    if (!campoData) return new Date();
    if (campoData instanceof Date) return campoData;
    if (campoData && typeof campoData.toDate === 'function') return campoData.toDate();
    if (typeof campoData === 'string') { const d = new Date(campoData); return isNaN(d.getTime()) ? new Date() : d; }
    if (typeof campoData === 'number') return new Date(campoData);
    return new Date();
  }
}