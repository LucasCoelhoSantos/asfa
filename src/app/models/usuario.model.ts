export type UsuarioRole = 'admin' | 'user';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UsuarioRole;
  ativo: boolean;
}