import { CategoriaAnexo } from '../../domains/pessoa-idosa/domain/value-objects/enums';
import { CargoUsuario } from '../../domains/usuario/domain/value-objects/enums';
import { 
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
} from '../../domains/pessoa-idosa/domain/value-objects/enums';

export const CATEGORIA_ANEXO_INFO = {
  [CategoriaAnexo.FOTO_PERFIL]: { label: 'Foto de Perfil', icon: 'bi-person-circle', class: 'bg-primary' },
  [CategoriaAnexo.CPF]: { label: 'CPF', icon: 'bi-card-text', class: 'bg-info'  },
  [CategoriaAnexo.RG]: { label: 'RG', icon: 'bi-person-vcard', class: 'bg-info' },
  [CategoriaAnexo.COMPROVANTE_ENDERECO]: { label: 'Comprovante Endereço', icon: 'bi-house', class: 'bg-secondary' },
  [CategoriaAnexo.CARTAO_SUS]: { label: 'Foto Cartão SUS', icon: 'bi-postcard-heart', class: 'bg-success' },
  [CategoriaAnexo.CADASTRO_NIS]: { label: 'Cadastro NIS', icon: 'bi-clipboard-data', class: 'bg-warning text-dark' },
  [CategoriaAnexo.TERMO_AUTORIZACAO]: { label: 'Termo Autorização', icon: 'bi-pen', class: 'bg-dark' }
} as const;

export const CATEGORIA_ANEXO_LISTA = Object.entries(CATEGORIA_ANEXO_INFO).map(([key, value]) => ({
  id: Number(key) as CategoriaAnexo,
  ...value
}));

export const CARGO_USUARIO_INFO = {
  [CargoUsuario.Usuario]: { label: CargoUsuario.Usuario, icon: 'bi-person', class: 'bg-secondary' },
  [CargoUsuario.Administrador]: { label: CargoUsuario.Administrador, icon: 'bi-shield-lock', class: 'bg-warning text-dark' }
} as const;

export const CARGO_USUARIO_LISTA = Object.entries(CARGO_USUARIO_INFO).map(([key, value]) => ({
  id: key as CargoUsuario,
  ...value
}));

export const ESTADO_CIVIL_OPCOES = Object.values(EstadoCivil);
export const MORADIA_OPCOES = Object.values(Moradia);
export const BENEFICIO_OPCOES = Object.values(Beneficio);
export const RENDA_OPCOES = Object.values(Renda);
export const SITUACAO_OCUPACIONAL_OPCOES = Object.values(SituacaoOcupacional);
export const APOSENTADO_OPCOES = Object.values(Aposentado);
export const DEFICIENCIA_OPCOES = Object.values(Deficiencia);
export const ESCOLARIDADE_OPCOES = Object.values(Escolaridade);
export const TIPO_FORMACAO_PROFISSIONAL_OPCOES = Object.values(TipoFormacaoProfissional);
export const PROBLEMA_DE_SAUDE_OPCOES = Object.values(ProblemaDeSaude);

export const STATUS_OPCOES = [
  { id: true, label: 'Ativo' },
  { id: false, label: 'Inativo' }
];

export const BOOLEAN_OPCOES = [
  { id: true, label: 'Sim' },
  { id: false, label: 'Não' }
];