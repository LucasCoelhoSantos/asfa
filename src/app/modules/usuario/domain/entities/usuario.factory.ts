import { Usuario } from './usuario.entity';

export class UsuarioFactory {
  static criar(input: Partial<Usuario>): Readonly<Usuario> {
    if (!input.nome || !input.nome.trim()) throw new Error('Nome é obrigatório');
    if (!input.email || !input.email.trim()) throw new Error('Email é obrigatório');
    if (typeof input.ativo !== 'boolean') throw new Error('Campo ativo é obrigatório');
    if (input.cargo === undefined || input.cargo === null) throw new Error('Cargo é obrigatório');

    return Object.freeze({
      id: input.id || '',
      nome: input.nome.trim(),
      email: input.email.trim(),
      cargo: input.cargo,
      ativo: input.ativo
    });
  }
}