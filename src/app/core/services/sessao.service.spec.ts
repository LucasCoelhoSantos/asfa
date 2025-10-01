import { SessaoService } from './sessao.service';

describe('SessaoService', () => {
  const service = new SessaoService();

  it('deve negar acesso quando usuário for nulo', () => {
    expect(service.temCargo([1 as any])).toBeFalse();
  });

  it('deve permitir acesso quando cargo estiver na lista', () => {
    const usuario = { id: '1', nome: 'A', email: 'a@a', cargo: 2 as any, ativo: true };
    expect(service.temCargo([1 as any, 2 as any])).toBeTrue();
  });
});