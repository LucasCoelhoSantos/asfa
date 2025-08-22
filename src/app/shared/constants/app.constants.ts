import { 
  Moradia, 
  Beneficio, 
  Renda, 
  SituacaoOcupacional, 
  Aposentado, 
  Deficiencia, 
  NivelSerieAtualConcluido, 
  CursoTecnicoFormacaoProfissional, 
  ProblemaDeSaude 
} from '../../models/enums';

export const TIPOS_ANEXO = [
  { id: 1, tipo: 1, label: 'Foto de Perfil', icon: '👤' },
  { id: 2, tipo: 2, label: 'CPF', icon: '🆔' },
  { id: 3, tipo: 3, label: 'RG', icon: '📋' },
  { id: 4, tipo: 4, label: 'Comprovante Endereço', icon: '🏠' },
  { id: 5, tipo: 5, label: 'Foto Cartão SUS', icon: '🏥' },
  { id: 6, tipo: 6, label: 'Cadastro NIS', icon: '📊' },
  { id: 7, tipo: 7, label: 'Termo Autorização', icon: '✍️' }
];

export const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)'
];

export const MORADIAS_OPTIONS = Object.values(Moradia);
export const BENEFICIOS_OPTIONS = Object.values(Beneficio);
export const RENDAS_OPTIONS = Object.values(Renda);
export const SITUACOES_OCUPACIONAIS_OPTIONS = Object.values(SituacaoOcupacional);
export const APOSENTADOS_OPTIONS = Object.values(Aposentado);
export const DEFICIENCIAS_OPTIONS = Object.values(Deficiencia);
export const NIVEIS_SERIE_OPTIONS = Object.values(NivelSerieAtualConcluido);
export const CURSOS_FORMACAO_OPTIONS = Object.values(CursoTecnicoFormacaoProfissional);
export const PROBLEMAS_SAUDE_OPTIONS = Object.values(ProblemaDeSaude);

export const ROLES_USUARIO = ['admin', 'user'] as const;
