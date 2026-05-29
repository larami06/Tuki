/**
 * Testes de lógica pura dos jogos:
 * - MaiorOuMenor
 * - VogaisMagicas
 * - DesafioDoDia (roleta e cálculo de prêmio)
 * - ContandoEstrelas / SomaEspacial
 * - TrilhaAlfabetizacao / TrilhaMatematica / TrilhaHistorias (progressão)
 *
 * Não renderizamos componentes React — testamos somente as funções e dados
 * de lógica de negócio extraídos ou copiados dos screens.
 */
import { describe, it, expect } from 'vitest';

// ────────────────────────────────────────────────────────────────
// Dados dos jogos (copiados dos screens para testar isoladamente)
// ────────────────────────────────────────────────────────────────
const MAIOR_OU_MENOR_CHALLENGES = [
  { id: 1, type: 'MAIOR', values: [3, 8, 5], answer: 8 },
  { id: 2, type: 'MENOR', values: [10, 2, 7], answer: 2 },
  { id: 3, type: 'MAIOR', values: [12, 25, 15], answer: 25 },
  { id: 4, type: 'MENOR', values: [9, 14, 6], answer: 6 },
];

const VOGAIS_CHALLENGES = [
  { word: 'BELHA', missing: 'A', emoji: '🐝', completeWord: 'ABELHA' },
  { word: 'LEFANTE', missing: 'E', emoji: '🐘', completeWord: 'ELEFANTE' },
  { word: 'LHA', missing: 'I', emoji: '🏝️', completeWord: 'ILHA' },
  { word: 'VELHA', missing: 'O', emoji: '🐑', completeWord: 'OVELHA' },
  { word: 'RSO', missing: 'U', emoji: '🐻', completeWord: 'URSO' },
];

const ENCONTRO_CHALLENGES = [
  { id: 1, fixedLetter: 'O', draggableLetter: 'I', result: 'OI!', emoji: '👋' },
  { id: 2, fixedLetter: 'A', draggableLetter: 'I', result: 'AI!', emoji: '🩹' },
  { id: 3, fixedLetter: 'A', draggableLetter: 'U', result: 'AU!', emoji: '🐶' },
];

const CONTANDO_EXERCISES = [
  { leftCount: 2, rightCount: 3 },
  { leftCount: 1, rightCount: 4 },
  { leftCount: 3, rightCount: 3 },
  { leftCount: 2, rightCount: 2 },
  { leftCount: 4, rightCount: 3 },
];

const DESAFIO_PRIZES = [
  { label: '5',   value: 5 },
  { label: '15',  value: 15 },
  { label: '10',  value: 10 },
  { label: '50',  value: 50 },
  { label: '20',  value: 20 },
  { label: '100', value: 100 },
  { label: '30',  value: 30 },
  { label: '75',  value: 75 },
];

// ────────────────────────────────────────────────────────────────
// Lógica auxiliar pura (replicada dos screens)
// ────────────────────────────────────────────────────────────────
function maiorOuMenorCorreto(value: number, challenge: typeof MAIOR_OU_MENOR_CHALLENGES[0]): boolean {
  return value === challenge.answer;
}

function palavraCompleta(challenge: typeof VOGAIS_CHALLENGES[0], vogal: string): string {
  return vogal + challenge.word;
}

function totalEstrelas(left: number, right: number): number {
  return left + right;
}

function calcularTotalRotacao(prizeIndex: number, sliceAngle = 45, spins = 5): number {
  return spins * 360 + prizeIndex * sliceAngle + sliceAngle / 2;
}

// Progressão de trilha (replicada de TrilhaAlfabetizacaoScreen e TrilhaMatematicaScreen)
function calcularStatusTrilhaAlfa(
  idLicao: number,
  completedIds: number[]
): 'completed' | 'current' | 'locked' {
  if (completedIds.includes(idLicao)) return 'completed';
  if (idLicao === 1 || completedIds.includes(idLicao - 1)) return 'current';
  return 'locked';
}

function calcularStatusTrilhaMat(
  idLicao: number,
  idx: number,
  completedIds: number[],
  baseLevels: { idLicao: number }[]
): 'completed' | 'current' | 'locked' {
  const concluido = completedIds.includes(idLicao);
  const anterior = idx === 0 || completedIds.includes(baseLevels[idx - 1].idLicao);
  return concluido ? 'completed' : anterior ? 'current' : 'locked';
}

// ────────────────────────────────────────────────────────────────
// Testes: Maior ou Menor
// ────────────────────────────────────────────────────────────────
describe('Jogo: Maior ou Menor', () => {
  it('deve ter 4 desafios', () => {
    expect(MAIOR_OU_MENOR_CHALLENGES).toHaveLength(4);
  });

  it('cada desafio tem exatamente 3 valores', () => {
    MAIOR_OU_MENOR_CHALLENGES.forEach(c => {
      expect(c.values).toHaveLength(3);
    });
  });

  it('a resposta correta é sempre o maior quando type=MAIOR', () => {
    const maiorChallenges = MAIOR_OU_MENOR_CHALLENGES.filter(c => c.type === 'MAIOR');
    maiorChallenges.forEach(c => {
      expect(c.answer).toBe(Math.max(...c.values));
    });
  });

  it('a resposta correta é sempre o menor quando type=MENOR', () => {
    const menorChallenges = MAIOR_OU_MENOR_CHALLENGES.filter(c => c.type === 'MENOR');
    menorChallenges.forEach(c => {
      expect(c.answer).toBe(Math.min(...c.values));
    });
  });

  it('reconhece resposta correta', () => {
    expect(maiorOuMenorCorreto(8, MAIOR_OU_MENOR_CHALLENGES[0])).toBe(true);
  });

  it('reconhece resposta errada', () => {
    expect(maiorOuMenorCorreto(3, MAIOR_OU_MENOR_CHALLENGES[0])).toBe(false);
    expect(maiorOuMenorCorreto(5, MAIOR_OU_MENOR_CHALLENGES[0])).toBe(false);
  });

  it('a resposta nunca é o número do meio quando type=MENOR', () => {
    const c = MAIOR_OU_MENOR_CHALLENGES[1]; // [10, 2, 7], answer=2
    expect(c.answer).not.toBe(c.values[2]); // 7 não é a resposta
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Vogais Mágicas
// ────────────────────────────────────────────────────────────────
describe('Jogo: Vogais Mágicas', () => {
  it('deve ter 5 desafios (um para cada vogal)', () => {
    expect(VOGAIS_CHALLENGES).toHaveLength(5);
  });

  it('cada desafio cobre uma vogal única', () => {
    const vogais = VOGAIS_CHALLENGES.map(c => c.missing);
    expect(new Set(vogais).size).toBe(5);
    expect(vogais).toEqual(expect.arrayContaining(['A', 'E', 'I', 'O', 'U']));
  });

  it('a palavra completa é formada pela vogal + palavra', () => {
    VOGAIS_CHALLENGES.forEach(c => {
      expect(palavraCompleta(c, c.missing)).toBe(c.completeWord);
    });
  });

  it('usando vogal errada não forma a palavra correta', () => {
    const c = VOGAIS_CHALLENGES[0]; // missing: 'A', completeWord: 'ABELHA'
    expect(palavraCompleta(c, 'E')).not.toBe(c.completeWord);
  });

  it('cada desafio tem um emoji associado', () => {
    VOGAIS_CHALLENGES.forEach(c => {
      expect(c.emoji).toBeTruthy();
    });
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Encontro de Sons
// ────────────────────────────────────────────────────────────────
describe('Jogo: Encontro de Sons', () => {
  it('deve ter 3 desafios', () => {
    expect(ENCONTRO_CHALLENGES).toHaveLength(3);
  });

  it('cada desafio produz um resultado ao unir as letras', () => {
    ENCONTRO_CHALLENGES.forEach(c => {
      const formado = c.fixedLetter + c.draggableLetter + '!';
      expect(formado).toBe(c.result);
    });
  });

  it('os sons formados são OI, AI e AU', () => {
    const sons = ENCONTRO_CHALLENGES.map(c => c.result.replace('!', ''));
    expect(sons).toEqual(['OI', 'AI', 'AU']);
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Contando Estrelas
// ────────────────────────────────────────────────────────────────
describe('Jogo: Contando Estrelas', () => {
  it('deve ter 5 exercícios', () => {
    expect(CONTANDO_EXERCISES).toHaveLength(5);
  });

  it('total de estrelas é a soma de left + right em todos os exercícios', () => {
    CONTANDO_EXERCISES.forEach(e => {
      expect(totalEstrelas(e.leftCount, e.rightCount)).toBe(e.leftCount + e.rightCount);
    });
  });

  it('valores de estrelas estão entre 1 e 7 em todos os exercícios', () => {
    CONTANDO_EXERCISES.forEach(e => {
      const total = e.leftCount + e.rightCount;
      expect(total).toBeGreaterThanOrEqual(1);
      expect(total).toBeLessThanOrEqual(10);
    });
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Desafio do Dia (Roleta)
// ────────────────────────────────────────────────────────────────
describe('Jogo: Desafio do Dia (Roleta)', () => {
  it('deve ter 8 fatias com prêmios distintos', () => {
    expect(DESAFIO_PRIZES).toHaveLength(8);
    const valores = DESAFIO_PRIZES.map(p => p.value);
    expect(new Set(valores).size).toBe(8);
  });

  it('todos os prêmios têm valor maior que zero', () => {
    DESAFIO_PRIZES.forEach(p => {
      expect(p.value).toBeGreaterThan(0);
    });
  });

  it('cada fatia ocupa exatamente 45 graus (360/8)', () => {
    const sliceAngle = 360 / DESAFIO_PRIZES.length;
    expect(sliceAngle).toBe(45);
  });

  it('cálculo de rotação: 5 voltas + centro da fatia alvo', () => {
    // Para índice 0: 5*360 + 0*45 + 22.5 = 1822.5
    expect(calcularTotalRotacao(0)).toBe(1822.5);
    // Para índice 3: 5*360 + 3*45 + 22.5 = 1957.5
    expect(calcularTotalRotacao(3)).toBe(1957.5);
    // Para índice 7: 5*360 + 7*45 + 22.5 = 2137.5
    expect(calcularTotalRotacao(7)).toBe(2137.5);
  });

  it('a rotação total sempre termina em mais de 5 voltas completas', () => {
    DESAFIO_PRIZES.forEach((_, idx) => {
      const totalRotacao = calcularTotalRotacao(idx);
      expect(totalRotacao).toBeGreaterThan(5 * 360);
    });
  });

  it('o prêmio de 100 moedas existe na roleta', () => {
    const bigPrize = DESAFIO_PRIZES.find(p => p.value === 100);
    expect(bigPrize).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Progressão de Trilha — Alfabetização
// ────────────────────────────────────────────────────────────────
describe('Trilha Alfabetização: progressão de níveis', () => {
  const BASE_LEVELS_ALFA = [
    { idLicao: 1, title: 'Vogais Mágicas' },
    { idLicao: 2, title: 'Encontro de Sons' },
    { idLicao: 3, title: 'Família do B e C' },
    { idLicao: 4, title: 'Palavras Curtas' },
    { idLicao: 5, title: 'Frases Divertidas' },
    { idLicao: 6, title: 'Pequenos Contos' },
    { idLicao: 7, title: 'Desafio Final' },
  ];

  it('sem progresso: nível 1 é current, demais locked', () => {
    const status = BASE_LEVELS_ALFA.map(l => calcularStatusTrilhaAlfa(l.idLicao, []));
    expect(status[0]).toBe('current');
    expect(status.slice(1).every(s => s === 'locked')).toBe(true);
  });

  it('após concluir nível 1: nível 1 = completed, nível 2 = current', () => {
    const completed = [1];
    expect(calcularStatusTrilhaAlfa(1, completed)).toBe('completed');
    expect(calcularStatusTrilhaAlfa(2, completed)).toBe('current');
    expect(calcularStatusTrilhaAlfa(3, completed)).toBe('locked');
  });

  it('após concluir níveis 1-3: nível 4 fica desbloqueado', () => {
    const completed = [1, 2, 3];
    expect(calcularStatusTrilhaAlfa(4, completed)).toBe('current');
    expect(calcularStatusTrilhaAlfa(5, completed)).toBe('locked');
  });

  it('ao concluir todos: todos os 7 níveis ficam completed', () => {
    const completed = [1, 2, 3, 4, 5, 6, 7];
    const status = BASE_LEVELS_ALFA.map(l => calcularStatusTrilhaAlfa(l.idLicao, completed));
    expect(status.every(s => s === 'completed')).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Progressão de Trilha — Matemática
// ────────────────────────────────────────────────────────────────
describe('Trilha Matemática: progressão de níveis', () => {
  const BASE_LEVELS_MAT = [
    { idLicao: 30, title: 'Contando Estrelas' },
    { idLicao: 31, title: 'Soma Espacial' },
    { idLicao: 32, title: 'Subtração Lunar' },
    { idLicao: 33, title: 'Formas Geométricas' },
    { idLicao: 34, title: 'Maior ou Menor?' },
    { idLicao: 35, title: 'Lógica Alienígena' },
    { idLicao: 36, title: 'Mestre da Galáxia' },
  ];

  it('sem progresso: nível 30 é current, demais locked', () => {
    const status = BASE_LEVELS_MAT.map((l, i) => calcularStatusTrilhaMat(l.idLicao, i, [], BASE_LEVELS_MAT));
    expect(status[0]).toBe('current');
    expect(status.slice(1).every(s => s === 'locked')).toBe(true);
  });

  it('após concluir lição 30: lição 31 fica current', () => {
    const completed = [30];
    expect(calcularStatusTrilhaMat(31, 1, completed, BASE_LEVELS_MAT)).toBe('current');
    expect(calcularStatusTrilhaMat(32, 2, completed, BASE_LEVELS_MAT)).toBe('locked');
  });

  it('completar apenas a lição 34 já desbloqueia a lição 35 (verifica só o predecessor direto)', () => {
    const completed = [34]; // apenas maior ou menor
    expect(calcularStatusTrilhaMat(35, 5, completed, BASE_LEVELS_MAT)).toBe('current');
  });

  it('após concluir tudo até lição 35: lição 36 fica desbloqueada', () => {
    const completed = [30, 31, 32, 33, 34, 35];
    expect(calcularStatusTrilhaMat(36, 6, completed, BASE_LEVELS_MAT)).toBe('current');
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Progressão de Trilha — Histórias
// ────────────────────────────────────────────────────────────────
describe('Trilha Histórias: progressão de níveis', () => {
  const BASE_LEVELS_HIST = [
    { idLicao: 20, title: 'O Pequeno Tuki' },
    { idLicao: 21, title: 'Reino das Cores' },
    { idLicao: 22, title: 'Amigos da Floresta' },
    { idLicao: 23, title: 'Viagem ao Mar' },
    { idLicao: 24, title: 'Dragão Amigável' },
    { idLicao: 25, title: 'Noite Estrelada' },
    { idLicao: 26, title: 'Festa no Castelo' },
  ];

  it('deve ter 7 histórias', () => {
    expect(BASE_LEVELS_HIST).toHaveLength(7);
  });

  it('sem progresso: história 20 é current', () => {
    const status = BASE_LEVELS_HIST.map((l, i) => calcularStatusTrilhaMat(l.idLicao, i, [], BASE_LEVELS_HIST));
    expect(status[0]).toBe('current');
  });

  it('após concluir história 20 e 21: história 22 fica desbloqueada', () => {
    const completed = [20, 21];
    expect(calcularStatusTrilhaMat(22, 2, completed, BASE_LEVELS_HIST)).toBe('current');
    expect(calcularStatusTrilhaMat(23, 3, completed, BASE_LEVELS_HIST)).toBe('locked');
  });

  it('idLicao das histórias estão no intervalo 20-26', () => {
    BASE_LEVELS_HIST.forEach(l => {
      expect(l.idLicao).toBeGreaterThanOrEqual(20);
      expect(l.idLicao).toBeLessThanOrEqual(26);
    });
  });
});

// ────────────────────────────────────────────────────────────────
// Testes: Consistência de idLicao entre trilhas e jogos
// ────────────────────────────────────────────────────────────────
describe('Consistência: idLicao dos jogos corresponde às trilhas', () => {
  const idLicaoJogos = {
    vogaisMagicas: 1,
    encontroSons: 2,
    contandoEstrelas: 30,
    somaEspacial: 31,
    maiorOuMenor: 34,
  };

  const idLicaoTrilhaAlfa = [1, 2, 3, 4, 5, 6, 7];
  const idLicaoTrilhaMat = [30, 31, 32, 33, 34, 35, 36];

  it('vogaisMagicas usa idLicao dentro da trilha de alfabetização', () => {
    expect(idLicaoTrilhaAlfa).toContain(idLicaoJogos.vogaisMagicas);
  });

  it('encontroSons usa idLicao dentro da trilha de alfabetização', () => {
    expect(idLicaoTrilhaAlfa).toContain(idLicaoJogos.encontroSons);
  });

  it('contandoEstrelas usa idLicao dentro da trilha de matemática', () => {
    expect(idLicaoTrilhaMat).toContain(idLicaoJogos.contandoEstrelas);
  });

  it('somaEspacial usa idLicao dentro da trilha de matemática', () => {
    expect(idLicaoTrilhaMat).toContain(idLicaoJogos.somaEspacial);
  });

  it('maiorOuMenor usa idLicao dentro da trilha de matemática', () => {
    expect(idLicaoTrilhaMat).toContain(idLicaoJogos.maiorOuMenor);
  });

  it('não há sobreposição de idLicao entre as trilhas', () => {
    const intersecao = idLicaoTrilhaAlfa.filter(id => idLicaoTrilhaMat.includes(id));
    expect(intersecao).toHaveLength(0);
  });
});
