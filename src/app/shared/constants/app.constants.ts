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

export const CATEGORIAS_ANEXO_INFO = {
  [CategoriaAnexo.FOTO_PERFIL]: { label: 'Foto de Perfil', icon: 'bi-person-circle', class: 'bg-primary' },
  [CategoriaAnexo.CPF]: { label: 'CPF', icon: 'bi-card-text', class: 'bg-info'  },
  [CategoriaAnexo.RG]: { label: 'RG', icon: 'bi-person-vcard', class: 'bg-info' },
  [CategoriaAnexo.COMPROVANTE_ENDERECO]: { label: 'Comprovante Endereço', icon: 'bi-house', class: 'bg-secondary' },
  [CategoriaAnexo.CARTAO_SUS]: { label: 'Foto Cartão SUS', icon: 'bi-postcard-heart', class: 'bg-success' },
  [CategoriaAnexo.CADASTRO_NIS]: { label: 'Cadastro NIS', icon: 'bi-clipboard-data', class: 'bg-warning text-dark' },
  [CategoriaAnexo.TERMO_AUTORIZACAO]: { label: 'Termo Autorização', icon: 'bi-pen', class: 'bg-dark' }
} as const;

export const CATEGORIAS_ANEXO_LISTA = Object.entries(CATEGORIAS_ANEXO_INFO).map(([key, value]) => ({
  id: Number(key) as CategoriaAnexo,
  ...value
}));

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
