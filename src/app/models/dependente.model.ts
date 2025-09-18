import { ComposicaoFamiliar } from "./composicao-familiar.model";

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