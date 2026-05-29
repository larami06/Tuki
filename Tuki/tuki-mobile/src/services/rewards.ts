// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ItemType = 'moedas' | 'estrelas' | 'xp' | 'rubis' | 'nada';

export interface GameReward {
  moedas: number;
  estrelas: number;
  xp: number;
  rubis: number;
  perfeito: boolean;
}

export interface RouletteSlice {
  tipo: ItemType;
  valor: number;
  label: string;
  subLabel: string;
  color: string;
}

// ─── Fatias da roleta ─────────────────────────────────────────────────────────
// Rubis são raros: apenas 1 fatia de 8. "Nada" é o risco divertido.
export const ROULETTE_SLICES: RouletteSlice[] = [
  { tipo: 'moedas',   valor: 20,  label: '🪙',   subLabel: '20 moedas',   color: '#10B981' },
  { tipo: 'estrelas', valor: 10,  label: '⭐',   subLabel: '10 estrelas', color: '#3B82F6' },
  { tipo: 'moedas',   valor: 50,  label: '🪙',   subLabel: '50 moedas',   color: '#F97316' },
  { tipo: 'xp',       valor: 40,  label: '⚡',   subLabel: '40 XP',       color: '#8B5CF6' },
  { tipo: 'nada',     valor: 0,   label: '😅',   subLabel: 'nada...',  color: '#6B7280' },
  { tipo: 'moedas',   valor: 100, label: '🪙',  subLabel: '100 moedas',   color: '#EC4899' },
  { tipo: 'rubis',    valor: 1,   label: '💎',   subLabel: '1 rubi!',    color: '#DC2626' },
  { tipo: 'estrelas', valor: 25,  label: '⭐',   subLabel: '25 estrelas', color: '#14B8A6' },
];

// ─── Configuração de recompensas por lição ────────────────────────────────────
// Balanceamento: rubis são difíceis (apenas jogo perfeito em lições avançadas)
// XP e moedas escalam com dificuldade; ratio mínimo = 0.4 para incentivar terminar.
interface RewardConfig {
  baseXP: number;
  baseMoedas: number;
  baseEstrelas: number;
  perfeito?: { rubis: number };
}

const GAME_REWARDS: Record<number, RewardConfig> = {
  // ── Alfabetização (idLicao 1-7) ──────────────────────────────────────────
  1: { baseXP: 20, baseMoedas: 15, baseEstrelas: 5  },                           // Vogais Mágicas
  2: { baseXP: 15, baseMoedas: 12, baseEstrelas: 4  },                           // Encontro de Sons
  3: { baseXP: 22, baseMoedas: 18, baseEstrelas: 6  },                           // Família B/C
  4: { baseXP: 28, baseMoedas: 22, baseEstrelas: 7  },                           // Palavras Curtas
  5: { baseXP: 30, baseMoedas: 25, baseEstrelas: 8  },                           // Frases Divertidas
  6: { baseXP: 30, baseMoedas: 25, baseEstrelas: 8  },                           // Pequenos Contos
  7: { baseXP: 50, baseMoedas: 45, baseEstrelas: 15, perfeito: { rubis: 1 } },   // Desafio Final Alfa

  // ── Histórias (idLicao 20-26) ─────────────────────────────────────────────
  20: { baseXP: 20, baseMoedas: 15, baseEstrelas: 5  },
  21: { baseXP: 22, baseMoedas: 18, baseEstrelas: 6  },
  22: { baseXP: 25, baseMoedas: 20, baseEstrelas: 7  },
  23: { baseXP: 25, baseMoedas: 20, baseEstrelas: 7  },
  24: { baseXP: 28, baseMoedas: 22, baseEstrelas: 8  },
  25: { baseXP: 30, baseMoedas: 25, baseEstrelas: 9  },
  26: { baseXP: 40, baseMoedas: 35, baseEstrelas: 12, perfeito: { rubis: 1 } },

  // ── Matemática (idLicao 30-36) ────────────────────────────────────────────
  30: { baseXP: 20, baseMoedas: 15, baseEstrelas: 5  },                           // Contando Estrelas
  31: { baseXP: 25, baseMoedas: 20, baseEstrelas: 6  },                           // Soma Espacial
  32: { baseXP: 30, baseMoedas: 25, baseEstrelas: 8  },                           // Subtração Lunar
  33: { baseXP: 28, baseMoedas: 22, baseEstrelas: 7  },                           // Formas Geométricas
  34: { baseXP: 28, baseMoedas: 22, baseEstrelas: 7  },                           // Maior ou Menor
  35: { baseXP: 38, baseMoedas: 32, baseEstrelas: 11, perfeito: { rubis: 1 } },  // Lógica Alienígena
  36: { baseXP: 55, baseMoedas: 50, baseEstrelas: 18, perfeito: { rubis: 2 } },  // Mestre da Galáxia
};

// ─── Calcula recompensa de um jogo ────────────────────────────────────────────
// Ratio mínimo de 0.4 garante que completar o jogo (mesmo com erros) sempre recompensa.
export function calcularRecompensa(idLicao: number, acertos: number, total: number): GameReward {
  const config = GAME_REWARDS[idLicao] ?? { baseXP: 20, baseMoedas: 15, baseEstrelas: 5 };
  const ratio   = total > 0 ? Math.max(0.4, acertos / total) : 1;
  const perfeito = total > 0 && acertos >= total;

  return {
    moedas:   Math.round(config.baseMoedas   * ratio),
    estrelas: Math.round(config.baseEstrelas * ratio),
    xp:       Math.round(config.baseXP       * ratio),
    rubis:    perfeito && config.perfeito ? config.perfeito.rubis : 0,
    perfeito,
  };
}
