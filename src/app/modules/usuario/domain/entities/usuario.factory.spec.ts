import { UsuarioFactory } from './usuario.factory';

describe('UsuarioFactory', () => {
  it('deve criar um usuário válido com campos normalizados e imutável', () => {
    const usuario = UsuarioFactory.criar({
      nome: '  Maria  ',
      email: '  maria@example.com  ',
      cargo: 1 as any,
      ativo: true
    });

    expect(usuario.nome).toBe('Maria');
    expect(usuario.email).toBe('maria@example.com');
    expect(usuario.ativo).toBeTrue();

    expect(() => ((usuario as any).nome = 'Outro')).toThrowError();
  });

  it('deve lançar erro quando faltar campos obrigatórios', () => {
    expect(() => UsuarioFactory.criar({ nome: '', email: 'a@a', cargo: 1 as any, ativo: true })).toThrow();
    expect(() => UsuarioFactory.criar({ nome: 'A', email: '', cargo: 1 as any, ativo: true })).toThrow();
    expect(() => UsuarioFactory.criar({ nome: 'A', email: 'a@a', cargo: 1 as any } as any)).toThrow();
  });
});