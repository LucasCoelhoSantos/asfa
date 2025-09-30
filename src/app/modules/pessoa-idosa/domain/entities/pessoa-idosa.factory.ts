import { PessoaIdosa } from './pessoa-idosa.entity';
import { Endereco } from '../value-objects/endereco.vo';
import { ComposicaoFamiliar } from '../value-objects/composicao-familiar.vo';
import { Anexo } from '../value-objects/anexo.vo';

export class PessoaIdosaFactory {
  static criar(input: Partial<PessoaIdosa>): PessoaIdosa {
    if (!input.nome || !input.nome.trim()) throw new Error('Nome é obrigatório');
    if (!input.cpf || !input.cpf.trim()) throw new Error('CPF é obrigatório');

    const agora = new Date();
    return {
      id: input.id || '',
      dataCadastro: input.dataCadastro || agora,
      nome: input.nome.trim(),
      dataNascimento: input.dataNascimento || agora,
      ativo: input.ativo ?? true,
      estadoCivil: input.estadoCivil || '',
      cpf: input.cpf,
      rg: input.rg || '',
      orgaoEmissor: input.orgaoEmissor || '',
      religiao: input.religiao || '',
      naturalidade: input.naturalidade || '',
      telefone: input.telefone || '',
      email: input.email,
      prontuarioSaude: input.prontuarioSaude || '',
      aposentadoConsegueSeManterComSuaRenda: input.aposentadoConsegueSeManterComSuaRenda ?? false,
      comoComplementa: input.comoComplementa || '',
      beneficio: input.beneficio || '',
      observacao: input.observacao || '',
      historicoFamiliarSocial: input.historicoFamiliarSocial || '',
      composicaoFamiliar: input.composicaoFamiliar instanceof ComposicaoFamiliar
        ? input.composicaoFamiliar
        : ComposicaoFamiliar.criar((input.composicaoFamiliar as any) || {}),
      endereco: input.endereco instanceof Endereco
        ? input.endereco
        : Endereco.criar((input.endereco as any) || { cep: '', moradia: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }),
      dependentes: input.dependentes || [],
      anexos: (input.anexos || []).map((a: any) => a instanceof Anexo ? a : Anexo.criar(a))
    };
  }
}
