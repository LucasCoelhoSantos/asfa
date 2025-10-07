export enum Beneficio {
  NAO = 'Não',
  BENEFICIO_DE_PRESTACAO_CONTINUADA_IDOSO = 'Benefício de Prestação Continuada - Idoso',
  BENEFICIO_DE_PRESTACAO_CONTINUADA_PCD = 'Benefício de Prestação Continuada - PcD',
  PROGRAMA_BOLSA_FAMILIA = 'Programa Bolsa Família',
  PRE_JOVEM = 'Pré-Jovem',
  PASSE_SOCIAL = 'Passe Social',
  OUTRO = 'Outro'
}

export enum Renda {
  SEM_RENDA = 'Sem Renda',
  ATE_1_SALARIO_MINIMO = 'Até 1 Salário Mínimo',
  ATE_2_SALARIOS_MINIMOS = 'Até 2 Salários Mínimos',
  ACIMA_DE_2_SALARIOS_MINIMOS = 'Acima de 2 Salários Mínimos'
}

export enum SituacaoOcupacional {
  ASSALARIADO_CARTEIRA_ASSINADA_OU_FUNCIONARIO_PUBLICO = 'Assalariado (Carteira Assinada) ou Funcionário Público',
  ASSALARIADO_SEM_CARTEIRA_ASSINADA = 'Assalariado (Sem Carteira Assinada)',
  APOSENTADO = 'Aposentado',
  PENSIONISTA = 'Pensionista',
  DIARISTA = 'Diarista',
  AUTONOMO = 'Autônomo',
  APRENDIZ = 'Aprendiz',
  TRABALHO_INFORMAL = 'Trabalho Informal',
  DESEMPREGADO = 'Desempregado',
  OUTRO = 'Outro'
}

export enum Aposentado {
  NAO = 'Não',
  TEMPO_DE_SERVICO = 'Tempo de Serviço',
  PROPORCINAL = 'Proporcional',
  INVALIDEZ = 'Invalidez',
  FUNRURAL = 'Funrural',
  RESERVA = 'Reserva',
  OUTRO = 'Outro'
}

export enum Deficiencia {
  NAO = 'Não',
  AUDITIVA = 'Auditiva',
  VISUAL = 'Visual',
  MENTAL = 'Mental',
  FISICA = 'Física',
  MULTILPAS = 'Múltiplas',
  OUTRA = 'Outra'
}

export enum Escolaridade {
  EDUCACAO_INFANTIL = 'Educação Infantil',
  ENSINO_FUNDAMENTAL_COMPLETO = 'Ensino Fundamental Completo',
  ENSINO_FUNDAMENTAL_INCOMPLETO = 'Ensino Fundamental Incompleto',
  ENSINO_MEDIO_COMPLETO = 'Ensino Médio Completo',
  ENSINO_MEDIO_INCOMPLETO = 'Ensino Médio Incompleto',
  SUPERIOR_COMPLETO = 'Superior Completo',
  SUPERIOR_INCOMPLETO = 'Superior Incompleto'
}

export enum TipoFormacaoProfissional {
  NAO = 'Não',
  TECNICO = 'Técnico',
  MOVA = 'MOVA',
  EJA = 'EJA',
  OUTRO = 'Outro'
}

export enum ProblemaDeSaude {
  NAO = 'Não',
  DIABETES = 'Diabetes',
  COLESTEROL = 'Colesterol',
  HIPERTENSAO = 'Hipertensão',
  RENAL = 'Renal',
  CARDIACA = 'Cardíaca',
  OSTEOPOROSE = 'Osteoporose',
  ARTROSE = 'Artrose',
  COLUNA = 'Coluna',
  EPILEPSIA = 'Epilepsia',
  HIV = 'HIV',
  HANSENIASE = 'Hanseníase',
  ALCOOLATRA = 'Alcoólatra',
  DEPENDENTE_QUIMICO = 'Dependente Químico',
  OUTRO = 'Outro'
}

export enum Moradia {
  PROPRIA = 'Própria',
  ALUGADA = 'Alugada',
  CEDIDA = 'Cedida',
  INSTITUCIONALIZADA = 'Institucionalizada',
  OUTRO = 'Outro'
}

export enum EstadoCivil {
  SOLTEIRO = 'Solteiro(a)',
  CASADO = 'Casado(a)',
  DIVORCIADO = 'Divorciado(a)',
  VIUVO = 'Viúvo(a)'
}

export enum CategoriaAnexo {
  FOTO_PERFIL = 1,
  CPF = 2,
  RG = 3,
  COMPROVANTE_ENDERECO = 4,
  CARTAO_SUS = 5,
  CADASTRO_NIS = 6,
  TERMO_AUTORIZACAO = 7
}