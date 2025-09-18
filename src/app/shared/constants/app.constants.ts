import { 
  CargoUsuario,
  Moradia, 
  Beneficio, 
  Renda, 
  SituacaoOcupacional, 
  Aposentado, 
  Deficiencia, 
  Escolaridade, 
  TipoFormacaoProfissional, 
  ProblemaDeSaude,
  EstadoCivil
} from '../../models/enums';

export const CATEGORIAS_ANEXO = [
  { id: 1, categoria: 1, label: 'Foto de Perfil', icon: 'bi-person-circle', class: 'bg-primary' },
  { id: 2, categoria: 2, label: 'CPF', icon: 'bi-card-text', class: 'bg-info' },
  { id: 3, categoria: 3, label: 'RG', icon: 'bi-person-vcard', class: 'bg-info' },
  { id: 4, categoria: 4, label: 'Comprovante Endereço', icon: 'bi-house', class: 'bg-secondary' },
  { id: 5, categoria: 5, label: 'Foto Cartão SUS', icon: 'bi-postcard-heart', class: 'bg-success' },
  { id: 6, categoria: 6, label: 'Cadastro NIS', icon: 'bi-clipboard-data', class: 'bg-warning text-dark' },
  { id: 7, categoria: 7, label: 'Termo Autorização', icon: 'bi-pen', class: 'bg-dark' }
] as const;

export const CARGOS_USUARIO_OPCOES = Object.values(CargoUsuario);
export const ESTADO_CIVIL_OPCOES = Object.values(EstadoCivil);
export const MORADIAS_OPCOES = Object.values(Moradia);
export const BENEFICIOS_OPCOES = Object.values(Beneficio);
export const RENDAS_OPCOES = Object.values(Renda);
export const SITUACOES_OCUPACIONAIS_OPCOES = Object.values(SituacaoOcupacional);
export const APOSENTADO_OPCOES = Object.values(Aposentado);
export const DEFICIENCIA_OPCOES = Object.values(Deficiencia);
export const ESCOLARIDADE_OPCOES = Object.values(Escolaridade);
export const TIPO_FORMACAO_PROFISSIONAL_OPCOES = Object.values(TipoFormacaoProfissional);
export const PROBLEMA_DE_SAUDE_OPCOES = Object.values(ProblemaDeSaude);
