import { Injectable } from '@angular/core';
import { Anexo } from '../value-objects/anexo.vo';
import { ComposicaoFamiliar } from '../value-objects/composicao-familiar.vo';
import { Endereco } from '../value-objects/endereco.vo';
import { PessoaIdosa } from './pessoa-idosa.entity';

@Injectable({ providedIn: 'root' })
export class PessoaIdosaFactory {
  create(documento: any): PessoaIdosa {
    const dados = documento.data ? documento.data() : documento;
    const id = documento.id;

    return {
      id: id,
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
    if (typeof campoData === 'string') {
      const d = new Date(campoData);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    if (typeof campoData === 'number') return new Date(campoData);
    return new Date();
  }
}