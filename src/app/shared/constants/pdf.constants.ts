export const TEMA_PDF = {
  margemPadrao: 20,
  alturaCabecalho: 35,
  tamanhoLogo: 26,
  rodapeOffsetY: 15,
  fontes: {
    familia: 'helvetica' as const,
    pesoNormal: 'normal' as const,
    pesoNegrito: 'bold' as const,
    pesoItalico: 'italic' as const,
    tamanhoTitulo: 16,
    tamanhoSubtitulo: 14,
    tamanhoTexto: 12,
    tamanhoLegenda: 10,
    tamanhoRodape: 8,
  },
  cores: {
    cabecalhoTabela: [70, 130, 180] as const,
    textoCabecalhoTabela: 255 as const,
    zebra: [245, 245, 245] as const,
    bordaSuave: 200 as const,
  },
  tabela: {
    larguraColunaManual: 25,
    alturaLinhaManual: 8,
    paddingCelulaManualX: 2,
    paddingCelulaManualY: 5,
  },
} as const;

export const ROTULOS_PDF = {
  instituicao: 'Associação Católica Sagrada Família - Lar Misericordioso',
  localData: 'Campo Grande/MS',
  geradoEm: 'Gerado em',
  fichaPessoaIdosa: 'Ficha de Pessoa Idosa',
  relatorioPessoas: 'Relatório de Pessoas Idosas Cadastradas',
  informacoesPessoais: 'Informações Pessoais',
  endereco: 'Endereço',
  composicaoFamiliar: 'Composição Familiar',
  dependentes: 'Dependentes',
  observacoesHistorico: 'Observações e Histórico',
  observacoes: 'Observações:',
  historicoFamiliarSocial: 'Histórico Familiar e Social:',
  filtrosAplicados: 'Filtros aplicados:',
  anexo: 'Anexo',
  documento: 'Documento',
  statusAtivo: 'Ativo',
  statusInativo: 'Inativo',
} as const;

export type TemaPdf = typeof TEMA_PDF;
