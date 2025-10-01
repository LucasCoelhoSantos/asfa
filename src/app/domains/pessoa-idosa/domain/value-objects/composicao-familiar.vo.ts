export class ComposicaoFamiliar {
    readonly alfabetizado!: boolean;
    readonly estudaAtualmente!: boolean;
    readonly nivelSerieAtualConcluido!: string;
    readonly cursosTecnicoFormacaoProfissional!: string;
    readonly situacaoOcupacional!: string;
    readonly renda!: string;
    readonly aposentado!: string;
    readonly beneficio!: string;
    readonly deficiencia!: string;
    readonly problemaDeSaude!: string;
    readonly fazAlgumTratamento!: boolean;
    readonly fazAlgumTratamentoOnde!: string;
    readonly usaMedicamentoControlado!: boolean;
    readonly usaRecursosUbsLocal!: boolean;
    readonly trabalhoPastoralOuSocial!: string;
    readonly atividadeNaComunidadeSagradaFamilia!: string;
    readonly trabalhoVoluntario!: string;
    readonly trabalhoVoluntarioOnde!: string;

    private constructor(props: ComposicaoFamiliar) {
        Object.assign(this, props);
        ComposicaoFamiliar.validar(this);
        Object.freeze(this);
    }

    static criar(props: Partial<ComposicaoFamiliar>): ComposicaoFamiliar {
        const valoresPadrao = {
            alfabetizado: false,
            estudaAtualmente: false,
            nivelSerieAtualConcluido: '',
            cursosTecnicoFormacaoProfissional: '',
            situacaoOcupacional: '',
            renda: '',
            aposentado: '',
            beneficio: '',
            deficiencia: '',
            problemaDeSaude: '',
            fazAlgumTratamento: false,
            fazAlgumTratamentoOnde: '',
            usaMedicamentoControlado: false,
            usaRecursosUbsLocal: false,
            trabalhoPastoralOuSocial: '',
            atividadeNaComunidadeSagradaFamilia: '',
            trabalhoVoluntario: '',
            trabalhoVoluntarioOnde: '',
        } as ComposicaoFamiliar;

        return new ComposicaoFamiliar({ ...valoresPadrao, ...(props as any) });
    }

    private static validar(c: ComposicaoFamiliar): void {
        // Exemplo simples: limite de tamanho em alguns campos textuais
        const camposTexto = [
            c.nivelSerieAtualConcluido,
            c.cursosTecnicoFormacaoProfissional,
            c.situacaoOcupacional,
            c.renda,
            c.aposentado,
            c.beneficio,
            c.deficiencia,
            c.problemaDeSaude,
            c.fazAlgumTratamentoOnde,
            c.trabalhoPastoralOuSocial,
            c.atividadeNaComunidadeSagradaFamilia,
            c.trabalhoVoluntario,
            c.trabalhoVoluntarioOnde,
        ];
        if (camposTexto.some(t => t && t.length > 500)) {
            throw new Error('Campos de composição familiar excedem limite de 500 caracteres');
        }
    }

    public toJSON() {
        return {
            
        };
    }
}