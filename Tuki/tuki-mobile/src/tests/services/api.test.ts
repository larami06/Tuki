import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  criarUsuario,
  buscarUsuarioPorId,
  buscarPerfisDoResponsavel,
  registrarProgresso,
  buscarProgressoDoUsuario,
  atualizarInventario,
  buscarRecompensas,
  comprarRecompensa,
  criarResponsavel,
  loginResponsavel,
  atualizarUsuario,
  API_URL,
} from '../../services/api';

const mockFetch = (body: unknown, ok = true, status = 200) => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ────────────────────────────────────────────────────────────────
// API_URL
// ────────────────────────────────────────────────────────────────
describe('API_URL', () => {
  it('deve usar o host detectado pelo expo-constants', () => {
    expect(API_URL).toBe('http://localhost:5276');
  });
});

// ────────────────────────────────────────────────────────────────
// criarUsuario
// ────────────────────────────────────────────────────────────────
describe('criarUsuario', () => {
  it('faz POST /api/Usuarios com o body correto', async () => {
    const payload = { nick: 'Tuki', idade: 6, idResponsavel: 1, avatar: 'tucano' };
    const resposta = { id: 42, ...payload, moedas: 0, estrelas: 0, licoesConcluidas: 0, streakAtual: 0, xp: 0, tema: 'default' };
    mockFetch(resposta);

    const result = await criarUsuario(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Usuarios`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual(resposta);
  });

  it('lança erro quando o servidor retorna status de falha', async () => {
    mockFetch({ message: 'Nick já existe' }, false, 400);

    await expect(criarUsuario({ nick: 'X', idade: 5, idResponsavel: 1, avatar: 'a' }))
      .rejects
      .toThrow('Erro 400');
  });
});

// ────────────────────────────────────────────────────────────────
// buscarUsuarioPorId
// ────────────────────────────────────────────────────────────────
describe('buscarUsuarioPorId', () => {
  it('faz GET /api/Usuarios/:id', async () => {
    const usuario = { id: 7, nick: 'Ana', idade: 7, moedas: 100, estrelas: 5, licoesConcluidas: 3, streakAtual: 2, xp: 50, avatar: 'gato', tema: 'azul', idResponsavel: 1 };
    mockFetch(usuario);

    const result = await buscarUsuarioPorId(7);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/Usuarios/7`);
    expect(result.id).toBe(7);
    expect(result.nick).toBe('Ana');
  });

  it('lança erro quando usuário não existe', async () => {
    mockFetch({}, false, 404);
    await expect(buscarUsuarioPorId(999)).rejects.toThrow('Erro ao buscar usuário por ID');
  });
});

// ────────────────────────────────────────────────────────────────
// buscarPerfisDoResponsavel
// ────────────────────────────────────────────────────────────────
describe('buscarPerfisDoResponsavel', () => {
  it('faz GET /api/Usuarios/responsavel/:id e retorna lista', async () => {
    const lista = [
      { id: 1, nick: 'Tom', idade: 5, moedas: 0, estrelas: 0, licoesConcluidas: 0, streakAtual: 0, xp: 0, avatar: '', tema: '', idResponsavel: 10 },
      { id: 2, nick: 'Bia', idade: 7, moedas: 50, estrelas: 2, licoesConcluidas: 1, streakAtual: 1, xp: 20, avatar: '', tema: '', idResponsavel: 10 },
    ];
    mockFetch(lista);

    const result = await buscarPerfisDoResponsavel(10);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/Usuarios/responsavel/10`);
    expect(result).toHaveLength(2);
    expect(result[0].nick).toBe('Tom');
  });
});

// ────────────────────────────────────────────────────────────────
// registrarProgresso
// ────────────────────────────────────────────────────────────────
describe('registrarProgresso', () => {
  it('faz POST /api/Progressos com os campos corretos', async () => {
    const dto = { idUsuario: 1, idLicao: 34, pontuacao: 4, tentativas: 1, concluida: true };
    const resposta = { id: 100, ...dto, tempoResposta: 0, materia: 'matematica' };
    mockFetch(resposta);

    const result = await registrarProgresso(dto);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Progressos`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(dto) })
    );
    expect(result.idLicao).toBe(34);
    expect(result.concluida).toBe(true);
  });

  it('lança erro em caso de falha no servidor', async () => {
    mockFetch({ detail: 'erro' }, false, 500);
    await expect(registrarProgresso({ idUsuario: 1, idLicao: 1, tentativas: 1, concluida: true }))
      .rejects
      .toThrow('Erro 500');
  });
});

// ────────────────────────────────────────────────────────────────
// buscarProgressoDoUsuario
// ────────────────────────────────────────────────────────────────
describe('buscarProgressoDoUsuario', () => {
  it('retorna lista de progresso do usuário', async () => {
    const progressos = [
      { id: 1, idUsuario: 5, idLicao: 1, pontuacao: 5, tentativas: 1, tempoResposta: 0, concluida: true, materia: 'alfabetizacao' },
      { id: 2, idUsuario: 5, idLicao: 30, pontuacao: 5, tentativas: 2, tempoResposta: 0, concluida: false, materia: 'matematica' },
    ];
    mockFetch(progressos);

    const result = await buscarProgressoDoUsuario(5);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/Progressos/usuario/5`);
    expect(result).toHaveLength(2);
    expect(result.filter(p => p.concluida)).toHaveLength(1);
  });
});

// ────────────────────────────────────────────────────────────────
// atualizarInventario
// ────────────────────────────────────────────────────────────────
describe('atualizarInventario', () => {
  it('faz PUT /api/Inventarios/usuario/:id com moedas/estrelas/xp', async () => {
    mockFetch({}, true, 204);

    await atualizarInventario(3, 150, 10, 500);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Inventarios/usuario/3`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ moedas: 150, estrelas: 10, xp: 500 }),
      })
    );
  });

  it('lança erro quando servidor responde com falha', async () => {
    mockFetch({}, false, 400);
    await expect(atualizarInventario(1, 0, 0, 0)).rejects.toThrow('Erro ao atualizar inventário');
  });
});

// ────────────────────────────────────────────────────────────────
// buscarRecompensas
// ────────────────────────────────────────────────────────────────
describe('buscarRecompensas', () => {
  it('retorna lista de recompensas disponíveis', async () => {
    const recompensas = [
      { id: 1, tipo: 'tema', valor: 50, nome: 'Fundo Azul', identificador: 'bg_blue' },
      { id: 2, tipo: 'avatar', valor: 100, nome: 'Tucano Dourado', identificador: 'avatar_gold' },
    ];
    mockFetch(recompensas);

    const result = await buscarRecompensas();

    expect(result).toHaveLength(2);
    expect(result[0].identificador).toBe('bg_blue');
  });
});

// ────────────────────────────────────────────────────────────────
// comprarRecompensa
// ────────────────────────────────────────────────────────────────
describe('comprarRecompensa', () => {
  it('faz POST para comprar item e retorna inventário atualizado', async () => {
    const inventario = { idInventario: 1, idUsuario: 5, moedas: 50, estrelas: 3, licoesConcluidas: 2, streakAtual: 1, xp: 100 };
    mockFetch(inventario);

    const result = await comprarRecompensa(5, 1);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Inventarios/usuario/5/comprar`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ idRecompensa: 1 }) })
    );
    expect(result.moedas).toBe(50);
  });

  it('lança erro com mensagem do servidor quando saldo insuficiente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Saldo insuficiente' }),
    });

    await expect(comprarRecompensa(5, 99)).rejects.toThrow('Saldo insuficiente');
  });
});

// ────────────────────────────────────────────────────────────────
// criarResponsavel
// ────────────────────────────────────────────────────────────────
describe('criarResponsavel', () => {
  it('registra um novo responsável com email e senha', async () => {
    const resposta = { id: 10, email: 'pai@email.com' };
    mockFetch(resposta);

    const result = await criarResponsavel({ email: 'pai@email.com', senha: '123456' });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Responsaveis`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.id).toBe(10);
    expect(result.email).toBe('pai@email.com');
  });
});

// ────────────────────────────────────────────────────────────────
// loginResponsavel
// ────────────────────────────────────────────────────────────────
describe('loginResponsavel', () => {
  it('retorna dados do responsável em caso de login bem-sucedido', async () => {
    mockFetch({ id: 5, email: 'mae@email.com' });

    const result = await loginResponsavel('mae@email.com', 'senha123');

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Responsaveis/login`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.id).toBe(5);
  });

  it('lança erro com mensagem amigável em caso de credenciais inválidas', async () => {
    mockFetch({}, false, 401);

    await expect(loginResponsavel('x@x.com', 'errado')).rejects.toThrow('Email ou senha inválidos.');
  });
});

// ────────────────────────────────────────────────────────────────
// atualizarUsuario
// ────────────────────────────────────────────────────────────────
describe('atualizarUsuario', () => {
  it('faz PUT /api/Usuarios/:id e retorna usuário atualizado', async () => {
    const atualizado = { id: 3, nick: 'X', idade: 6, moedas: 0, estrelas: 0, licoesConcluidas: 0, streakAtual: 0, xp: 0, avatar: 'novo_avatar', tema: 'vermelho', idResponsavel: 1 };
    mockFetch(atualizado);

    const result = await atualizarUsuario(3, { avatar: 'novo_avatar', tema: 'vermelho' });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/Usuarios/3`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ avatar: 'novo_avatar', tema: 'vermelho' }) })
    );
    expect(result.avatar).toBe('novo_avatar');
  });
});
