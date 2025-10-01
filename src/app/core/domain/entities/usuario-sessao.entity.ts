import { CargoUsuario } from "../../../domains/usuario/domain/value-objects/enums";

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}