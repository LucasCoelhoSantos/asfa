export interface ComposicaoFamiliar {
    alfabetizado: boolean;
    estudaAtualmente: boolean;
    nivelSerieAtualConcluido: string;
    cursosTecnicoFormacaoProfissional: string;
    situacaoOcupacional: string;
    renda: string;
    aposentado: string;
    beneficio: string;
    deficiencia: string;
    problemaDeSaude: string;
    fazAlgumTratamento: boolean;
    fazAlgumTratamentoOnde: string;
    usaMedicamentoControlado: boolean;
    usaRecursosUbsLocal: boolean;
    trabalhoPastoralOuSocial: string;
    atividadeNaComunidadeSagradaFamilia: string;
    trabalhoVoluntario: string;
    trabalhoVoluntarioOnde: string;
}

export interface Endereco {
    cep: string;
    logradouro: string;
    numero: string;
    estado: string;
    cidade: string;
    bairro: string;
    moradia: string;
}

export interface Anexo {
    tipoAnexo: number;
    url: string;
    path: string;
}

export interface Dependente {
    id?: string;
    nome: string;
    dataNascimento: Date;
    parentesco: string;
    ceinf: string;
    ceinfBairro: string;
    programaSaudePastoralCrianca: string;
    programaSaudePastoralCriancaLocal: string;
    ativo: boolean;
    composicaoFamiliar: ComposicaoFamiliar;
}

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
    observacao: string;
    historicoFamiliarSocial: string;
    composicaoFamiliar: ComposicaoFamiliar;
    endereco: Endereco;
    dependentes: Dependente[];
    anexos: Anexo[];
}