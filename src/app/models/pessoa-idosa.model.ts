import { ComposicaoFamiliar } from "./composicao-familiar.model";
import { Endereco } from "./endereco.model";
import { Dependente } from "./dependente.model";
import { Anexo } from "./anexo.model";

export interface PessoaIdosa {
    id: string;
    dataCadastro: Date;
    nome: string;
    dataNascimento: Date;
    ativo: boolean;
    estadoCivil: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    religiao: string;
    naturalidade: string;
    telefone: string;
    prontuarioSaude: string;
    aposentadoConsegueSeManterComSuaRenda: boolean;
    comoComplementa: string;
    beneficio: string;
    observacao: string;
    historicoFamiliarSocial: string;
    composicaoFamiliar: ComposicaoFamiliar;
    endereco: Endereco;
    dependentes: Dependente[];
    anexos: Anexo[];
}

export interface PessoaIdosaListaDTO {
    nome: string;
    cpf: string;
    telefone: string;
    rg: string;
    endereco: Endereco;
    dataNascimento: Date;
    ativo: boolean;
}