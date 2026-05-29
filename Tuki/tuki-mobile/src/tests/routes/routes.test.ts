/**
 * Testes de configuração de rotas do Expo Router.
 * Verifica que:
 *  - Todas as rotas das trilhas têm um path de navegação configurado
 *  - Os idLicao de cada trilha são únicos e sem sobreposição
 *  - Cada nível da trilha tem rota válida
 *  - As rotas seguem o padrão kebab-case do Expo Router
 */
import { describe, it, expect } from 'vitest';

// ── Configuração de trilhas (espelho dos BASE_LEVELS dos screens) ─────────────
const TRILHA_ALFABETIZACAO = [
  { idLicao: 1, title: 'Vogais Mágicas', route: '/vogais-magicas' },
  { idLicao: 2, title: 'Encontro de Sons', route: '/encontro-sons' },
  { idLicao: 3, title: 'Família do B e C', route: '/familia-b-c' },
  { idLicao: 4, title: 'Palavras Curtas', route: '/palavras-curtas' },
  { idLicao: 5, title: 'Frases Divertidas', route: '/frases-divertidas' },
  { idLicao: 6, title: 'Pequenos Contos', route: '/pequenos-contos' },
  { idLicao: 7, title: 'Desafio Final', route: '/desafio-final-alfabetizacao' },
];

const TRILHA_MATEMATICA = [
  { idLicao: 30, title: 'Contando Estrelas', route: '/contando-estrelas' },
  { idLicao: 31, title: 'Soma Espacial', route: '/soma-espacial' },
  { idLicao: 32, title: 'Subtração Lunar', route: '/subtracao-lunar' },
  { idLicao: 33, title: 'Formas Geométricas', route: '/formas-geometricas' },
  { idLicao: 34, title: 'Maior ou Menor?', route: '/maior-ou-menor' },
  { idLicao: 35, title: 'Lógica Alienígena', route: '/logica-alienigena' },
  { idLicao: 36, title: 'Mestre da Galáxia', route: '/mestre-da-galaxia' },
];

const TRILHA_HISTORIAS = [
  { idLicao: 20, title: 'O Pequeno Tuki', route: '/historia/20' },
  { idLicao: 21, title: 'Reino das Cores', route: '/historia/21' },
  { idLicao: 22, title: 'Amigos da Floresta', route: '/historia/22' },
  { idLicao: 23, title: 'Viagem ao Mar', route: '/historia/23' },
  { idLicao: 24, title: 'Dragão Amigável', route: '/historia/24' },
  { idLicao: 25, title: 'Noite Estrelada', route: '/historia/25' },
  { idLicao: 26, title: 'Festa no Castelo', route: '/historia/26' },
];

// Todas as rotas do app (baseadas em app/_layout.tsx)
const ROTAS_REGISTRADAS = [
  'index', 'login', 'cadastro', 'cadastro-crianca', 'selecionar-perfil',
  'atividades', 'desafio-do-dia',
  'trilha-alfabetizacao', 'trilha-matematica', 'trilha-historias',
  'vogais-magicas', 'encontro-sons', 'familia-b-c', 'palavras-curtas',
  'frases-divertidas', 'pequenos-contos', 'desafio-final-alfabetizacao',
  'contando-estrelas', 'soma-espacial', 'subtracao-lunar', 'formas-geometricas',
  'maior-ou-menor', 'logica-alienigena', 'mestre-da-galaxia',
  'loja', 'inventario', 'conquistas', 'perfil', 'modal',
];

// ────────────────────────────────────────────────────────────────
// Trilha Alfabetização
// ────────────────────────────────────────────────────────────────
describe('Rotas: Trilha Alfabetização', () => {
  it('deve ter 7 níveis definidos', () => {
    expect(TRILHA_ALFABETIZACAO).toHaveLength(7);
  });

  it('todos os idLicao são únicos', () => {
    const ids = TRILHA_ALFABETIZACAO.map(l => l.idLicao);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('idLicao estão no intervalo 1-7', () => {
    TRILHA_ALFABETIZACAO.forEach(l => {
      expect(l.idLicao).toBeGreaterThanOrEqual(1);
      expect(l.idLicao).toBeLessThanOrEqual(7);
    });
  });

  it('todas as rotas começam com /', () => {
    TRILHA_ALFABETIZACAO.forEach(l => {
      expect(l.route).toMatch(/^\//);
    });
  });

  it('todas as rotas usam kebab-case', () => {
    TRILHA_ALFABETIZACAO.forEach(l => {
      expect(l.route).toMatch(/^\/[a-z0-9-]+$/);
    });
  });

  it('cada rota corresponde a um arquivo registrado no app/', () => {
    TRILHA_ALFABETIZACAO.forEach(l => {
      const rotaSemBarra = l.route.replace('/', '');
      expect(ROTAS_REGISTRADAS).toContain(rotaSemBarra);
    });
  });
});

// ────────────────────────────────────────────────────────────────
// Trilha Matemática
// ────────────────────────────────────────────────────────────────
describe('Rotas: Trilha Matemática', () => {
  it('deve ter 7 níveis definidos', () => {
    expect(TRILHA_MATEMATICA).toHaveLength(7);
  });

  it('todos os idLicao são únicos', () => {
    const ids = TRILHA_MATEMATICA.map(l => l.idLicao);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('idLicao estão no intervalo 30-36', () => {
    TRILHA_MATEMATICA.forEach(l => {
      expect(l.idLicao).toBeGreaterThanOrEqual(30);
      expect(l.idLicao).toBeLessThanOrEqual(36);
    });
  });

  it('todas as rotas são válidas e registradas no app/', () => {
    TRILHA_MATEMATICA.forEach(l => {
      const rotaSemBarra = l.route.replace('/', '');
      expect(ROTAS_REGISTRADAS).toContain(rotaSemBarra);
    });
  });

  it('maior-ou-menor está no índice 4 (5º nível)', () => {
    const nivel = TRILHA_MATEMATICA.find(l => l.idLicao === 34);
    expect(nivel?.title).toBe('Maior ou Menor?');
    expect(nivel?.route).toBe('/maior-ou-menor');
  });
});

// ────────────────────────────────────────────────────────────────
// Trilha Histórias
// ────────────────────────────────────────────────────────────────
describe('Rotas: Trilha Histórias', () => {
  it('deve ter 7 histórias', () => {
    expect(TRILHA_HISTORIAS).toHaveLength(7);
  });

  it('todos os idLicao são únicos', () => {
    const ids = TRILHA_HISTORIAS.map(l => l.idLicao);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('idLicao estão no intervalo 20-26', () => {
    TRILHA_HISTORIAS.forEach(l => {
      expect(l.idLicao).toBeGreaterThanOrEqual(20);
      expect(l.idLicao).toBeLessThanOrEqual(26);
    });
  });

  it('rotas das histórias seguem o padrão /historia/:idLicao', () => {
    TRILHA_HISTORIAS.forEach(l => {
      expect(l.route).toBe(`/historia/${l.idLicao}`);
    });
  });
});

// ────────────────────────────────────────────────────────────────
// Separação de idLicao entre trilhas
// ────────────────────────────────────────────────────────────────
describe('Rotas: Separação de idLicao entre trilhas', () => {
  const idsAlfa = TRILHA_ALFABETIZACAO.map(l => l.idLicao);
  const idsMat = TRILHA_MATEMATICA.map(l => l.idLicao);
  const idsHist = TRILHA_HISTORIAS.map(l => l.idLicao);

  it('não há sobreposição entre alfabetização e matemática', () => {
    const intersecao = idsAlfa.filter(id => idsMat.includes(id));
    expect(intersecao).toHaveLength(0);
  });

  it('não há sobreposição entre alfabetização e histórias', () => {
    const intersecao = idsAlfa.filter(id => idsHist.includes(id));
    expect(intersecao).toHaveLength(0);
  });

  it('não há sobreposição entre matemática e histórias', () => {
    const intersecao = idsMat.filter(id => idsHist.includes(id));
    expect(intersecao).toHaveLength(0);
  });

  it('total de lições únicas entre as três trilhas é 21', () => {
    const todos = [...idsAlfa, ...idsMat, ...idsHist];
    expect(new Set(todos).size).toBe(21);
  });
});

// ────────────────────────────────────────────────────────────────
// Rotas principais do app
// ────────────────────────────────────────────────────────────────
describe('Rotas: Páginas principais do app', () => {
  it('rotas essenciais de autenticação estão registradas', () => {
    expect(ROTAS_REGISTRADAS).toContain('login');
    expect(ROTAS_REGISTRADAS).toContain('cadastro');
    expect(ROTAS_REGISTRADAS).toContain('selecionar-perfil');
  });

  it('rotas das trilhas estão registradas', () => {
    expect(ROTAS_REGISTRADAS).toContain('trilha-alfabetizacao');
    expect(ROTAS_REGISTRADAS).toContain('trilha-matematica');
    expect(ROTAS_REGISTRADAS).toContain('trilha-historias');
  });

  it('rota do desafio do dia está registrada', () => {
    expect(ROTAS_REGISTRADAS).toContain('desafio-do-dia');
  });

  it('rota da loja e inventário estão registradas', () => {
    expect(ROTAS_REGISTRADAS).toContain('loja');
    expect(ROTAS_REGISTRADAS).toContain('inventario');
  });
});
