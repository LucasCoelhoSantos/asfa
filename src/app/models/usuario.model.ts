import { CargoUsuario } from './enums';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  ativo: boolean;
}
