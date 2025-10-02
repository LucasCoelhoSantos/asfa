export interface ComposicaoFamiliarProps {
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
    fazAlgumTratamentoOnde?: string;
    usaMedicamentoControlado: boolean;
    usaRecursosUbsLocal: boolean;
    trabalhoPastoralOuSocial: string;
    atividadeNaComunidadeSagradaFamilia: string;
    trabalhoVoluntario: string;
    trabalhoVoluntarioOnde?: string;
}

export class ComposicaoFamiliar {
    readonly alfabetizado: boolean;
    readonly estudaAtualmente: boolean;
    readonly nivelSerieAtualConcluido: string;
    readonly cursosTecnicoFormacaoProfissional: string;
    readonly situacaoOcupacional: string;
    readonly renda: string;
    readonly aposentado: string;
    readonly beneficio: string;
    readonly deficiencia: string;
    readonly problemaDeSaude: string;
    readonly fazAlgumTratamento: boolean;
    readonly fazAlgumTratamentoOnde: string;
    readonly usaMedicamentoControlado: boolean;
    readonly usaRecursosUbsLocal: boolean;
    readonly trabalhoPastoralOuSocial: string;
    readonly atividadeNaComunidadeSagradaFamilia: string;
    readonly trabalhoVoluntario: string;
    readonly trabalhoVoluntarioOnde: string;

    private constructor(props: ComposicaoFamiliarProps) {
        this.alfabetizado = props.alfabetizado;
        this.estudaAtualmente = props.estudaAtualmente;
        this.nivelSerieAtualConcluido = props.nivelSerieAtualConcluido;
        this.cursosTecnicoFormacaoProfissional = props.cursosTecnicoFormacaoProfissional;
        this.situacaoOcupacional = props.situacaoOcupacional;
        this.renda = props.renda;
        this.aposentado = props.aposentado;
        this.beneficio = props.beneficio;
        this.deficiencia = props.deficiencia;
        this.problemaDeSaude = props.problemaDeSaude;
        this.fazAlgumTratamento = props.fazAlgumTratamento;
        this.fazAlgumTratamentoOnde = props.fazAlgumTratamentoOnde || '';
        this.usaMedicamentoControlado = props.usaMedicamentoControlado;
        this.usaRecursosUbsLocal = props.usaRecursosUbsLocal;
        this.trabalhoPastoralOuSocial = props.trabalhoPastoralOuSocial;
        this.atividadeNaComunidadeSagradaFamilia = props.atividadeNaComunidadeSagradaFamilia;
        this.trabalhoVoluntario = props.trabalhoVoluntario;
        this.trabalhoVoluntarioOnde = props.trabalhoVoluntarioOnde || '';

        Object.freeze(this);
    }

    public static criar(props: ComposicaoFamiliarProps): ComposicaoFamiliar {
        return new ComposicaoFamiliar(props);
    }

    public static rehidratar(props: ComposicaoFamiliarProps): ComposicaoFamiliar {
        return new ComposicaoFamiliar(props);
    }

    public toJSON() {
        return {
            alfabetizado: this.alfabetizado,
            estudaAtualmente: this.estudaAtualmente,
            nivelSerieAtualConcluido: this.nivelSerieAtualConcluido,
            cursosTecnicoFormacaoProfissional: this.cursosTecnicoFormacaoProfissional,
            situacaoOcupacional: this.situacaoOcupacional,
            renda: this.renda,
            aposentado: this.aposentado,
            beneficio: this.beneficio,
            deficiencia: this.deficiencia,
            problemaDeSaude: this.problemaDeSaude,
            fazAlgumTratamento: this.fazAlgumTratamento,
            fazAlgumTratamentoOnde: this.fazAlgumTratamentoOnde,
            usaMedicamentoControlado: this.usaMedicamentoControlado,
            usaRecursosUbsLocal: this.usaRecursosUbsLocal,
            trabalhoPastoralOuSocial: this.trabalhoPastoralOuSocial,
            atividadeNaComunidadeSagradaFamilia: this.atividadeNaComunidadeSagradaFamilia,
            trabalhoVoluntario: this.trabalhoVoluntario,
            trabalhoVoluntarioOnde: this.trabalhoVoluntarioOnde
        };
    }
}