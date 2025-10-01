import { CargoUsuario } from '../value-objects/enums';

export interface CriarUsuarioProps {
  id?: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  ativo?: boolean;
}

export type AtualizarUsuarioProps = Partial<Omit<CriarUsuarioProps, 'id'>>;
export type AtualizarPerfilProps = Pick<CriarUsuarioProps, 'nome'>;

export class Usuario {
  private _id: string;
  private _nome: string;
  private _email: string;
  private _cargo: CargoUsuario;
  private _ativo: boolean;

  private constructor(props: CriarUsuarioProps) {
      if (!props.nome) throw new Error("O nome do usuário é obrigatório.");
      if (!props.email) throw new Error("O email do usuário é obrigatório.");

      this._id = props.id || '';
      this._nome = props.nome;
      this._email = props.email;
      this._cargo = props.cargo || CargoUsuario.Usuario;
      this._ativo = props.ativo ?? true;
  }

  public static criar(props: CriarUsuarioProps): Usuario {
      return new Usuario(props);
  }

  public atualizar(props: AtualizarUsuarioProps): void {
      this._nome = props.nome ?? this._nome;
      this._email = props.email ?? this._email;
      this._cargo = props.cargo ?? this._cargo;
      this._ativo = props.ativo ?? this._ativo;
  }

  public ativar(): void {
      this._ativo = true;
  }

  public inativar(): void {
      this._ativo = false;
  }

  // Getters
  public get id(): string { return this._id; }
  public get nome(): string { return this._nome; }
  public get email(): string { return this._email; }
  public get cargo(): CargoUsuario { return this._cargo; }
  public get ativo(): boolean { return this._ativo; }

  // Método para persistência
  public toJSON() {
      return {
          id: this._id,
          nome: this._nome,
          email: this._email,
          cargo: this._cargo,
          ativo: this._ativo,
      };
  }
}