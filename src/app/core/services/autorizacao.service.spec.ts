import { AutorizacaoService } from './autorizacao.service';

describe('AutorizacaoService', () => {
  const service = new AutorizacaoService();

  it('deve negar acesso quando usuário for nulo', () => {
    expect(service.temAcesso(null as any, [1 as any])).toBeFalse();
  });

  it('deve permitir acesso quando cargo estiver na lista', () => {
    const usuario = { id: '1', nome: 'A', email: 'a@a', cargo: 2 as any, ativo: true };
    expect(service.temAcesso(usuario as any, [1 as any, 2 as any])).toBeTrue();
  });
});