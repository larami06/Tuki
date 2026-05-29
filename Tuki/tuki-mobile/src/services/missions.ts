import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameReward } from './rewards';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type MissionTipo =
  | 'atividades'
  | 'matematica'
  | 'alfabetizacao'
  | 'historias'
  | 'perfeito'
  | 'streak'
  | 'variedade';

export interface MissionDef {
  id: string;
  titulo: string;
  descricao: string;
  meta: number;
  tipo: MissionTipo;
  recompensa: { moedas?: number; estrelas?: number; xp?: number; diamantes?: number };
}

export interface MissionProgress extends MissionDef {
  progresso: number;
  concluida: boolean;
  recompensaColetada: boolean;
}

export interface MissionCompletion {
  mission: MissionProgress;
  progrediu: boolean;
  acabouDeCompletar: boolean;
  recompensaGanha?: { moedas?: number; estrelas?: number; xp?: number; diamantes?: number };
}

// ─── Pool de missões (10 ao total, 3 sorteadas por dia) ──────────────────────
const MISSIONS_POOL: MissionDef[] = [
  {
    id: 'complete_3',
    titulo: 'Dia Produtivo!',
    descricao: 'Complete 3 atividades hoje',
    meta: 3, tipo: 'atividades',
    recompensa: { moedas: 50 },
  },
  {
    id: 'complete_5',
    titulo: 'Super Jogador!',
    descricao: 'Complete 5 atividades hoje',
    meta: 5, tipo: 'atividades',
    recompensa: { moedas: 80, estrelas: 10 },
  },
  {
    id: 'matematica_2',
    titulo: 'Matemático(a)!',
    descricao: 'Complete 2 jogos de Matemática',
    meta: 2, tipo: 'matematica',
    recompensa: { moedas: 40, xp: 30 },
  },
  {
    id: 'matematica_3',
    titulo: 'Astronauta! 🚀',
    descricao: 'Complete 3 jogos de Matemática',
    meta: 3, tipo: 'matematica',
    recompensa: { moedas: 60, estrelas: 12 },
  },
  {
    id: 'alfabetizacao_2',
    titulo: 'Leitor(a)!',
    descricao: 'Complete 2 jogos de Alfabetização',
    meta: 2, tipo: 'alfabetizacao',
    recompensa: { moedas: 40, xp: 30 },
  },
  {
    id: 'historia_1',
    titulo: 'Hora da História! 📖',
    descricao: 'Leia 1 história completa',
    meta: 1, tipo: 'historias',
    recompensa: { moedas: 35, estrelas: 8 },
  },
  {
    id: 'perfeito_1',
    titulo: 'Nota 10! 🌟',
    descricao: 'Termine um jogo sem errar nada',
    meta: 1, tipo: 'perfeito',
    recompensa: { diamantes: 1, moedas: 20 },
  },
  {
    id: 'perfeito_3',
    titulo: 'Gênio! 💎',
    descricao: 'Termine 3 jogos sem errar nada',
    meta: 3, tipo: 'perfeito',
    recompensa: { diamantes: 2, moedas: 50 },
  },
  {
    id: 'variedade',
    titulo: 'Explorador(a)! 🗺️',
    descricao: 'Jogue 1 atividade de cada trilha',
    meta: 3, tipo: 'variedade',
    recompensa: { moedas: 60, diamantes: 1 },
  },
  {
    id: 'streak_hoje',
    titulo: 'Consistente! 🔥',
    descricao: 'Jogue hoje para manter o streak',
    meta: 1, tipo: 'streak',
    recompensa: { estrelas: 15, xp: 20 },
  },
];

// ─── Seleciona 3 missões do dia baseado na data (mesmo set o dia todo) ────────
function selecionarMissoesHoje(): MissionDef[] {
  const hoje = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < hoje.length; i++) {
    hash = ((hash << 5) - hash) + hoje.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);
  const pool = [...MISSIONS_POOL];
  const selecionadas: MissionDef[] = [];

  let idx = seed % pool.length;
  for (let i = 0; i < 3; i++) {
    selecionadas.push(pool.splice(idx % pool.length, 1)[0]);
    idx = (idx * 6364136223846793005 + 1442695040888963407) >>> 0;
    idx = idx % pool.length || 0;
  }
  return selecionadas;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
function keyMissoes(idUsuario: number) {
  return `@tuki_missoes_${idUsuario}_${new Date().toDateString()}`;
}
function keyVariedade(idUsuario: number) {
  return `@tuki_variedade_${idUsuario}_${new Date().toDateString()}`;
}

// ─── Obtém missões de hoje (cria se não existir) ──────────────────────────────
export async function obterMissoesHoje(idUsuario: number): Promise<MissionProgress[]> {
  const key = keyMissoes(idUsuario);
  const raw = await AsyncStorage.getItem(key);
  if (raw) return JSON.parse(raw) as MissionProgress[];

  const defs = selecionarMissoesHoje();
  const missoes: MissionProgress[] = defs.map(d => ({
    ...d,
    progresso: 0,
    concluida: false,
    recompensaColetada: false,
  }));
  await AsyncStorage.setItem(key, JSON.stringify(missoes));
  return missoes;
}

// ─── Salva missões de hoje ────────────────────────────────────────────────────
async function salvarMissoes(idUsuario: number, missoes: MissionProgress[]) {
  await AsyncStorage.setItem(keyMissoes(idUsuario), JSON.stringify(missoes));
}

// ─── Atualiza progresso após completar um jogo ───────────────────────────────
const IDS_MATEMATICA    = [30, 31, 32, 33, 34, 35, 36];
const IDS_ALFABETIZACAO = [1, 2, 3, 4, 5, 6, 7];
const IDS_HISTORIAS     = [20, 21, 22, 23, 24, 25, 26];

export async function atualizarMissoes(
  idUsuario: number,
  idLicao: number,
  reward: GameReward,
  streakSubiu: boolean,
): Promise<MissionCompletion[]> {
  const missoes = await obterMissoesHoje(idUsuario);
  const resultados: MissionCompletion[] = [];

  // Rastreia trilhas jogadas hoje para a missão "variedade"
  const keyVar = keyVariedade(idUsuario);
  const varRaw = await AsyncStorage.getItem(keyVar);
  const trilhasJogadas: Set<string> = varRaw ? new Set(JSON.parse(varRaw)) : new Set();

  if (IDS_MATEMATICA.includes(idLicao))    trilhasJogadas.add('matematica');
  if (IDS_ALFABETIZACAO.includes(idLicao)) trilhasJogadas.add('alfabetizacao');
  if (IDS_HISTORIAS.includes(idLicao))     trilhasJogadas.add('historias');
  await AsyncStorage.setItem(keyVar, JSON.stringify([...trilhasJogadas]));

  for (const m of missoes) {
    if (m.concluida) {
      resultados.push({ mission: m, progrediu: false, acabouDeCompletar: false });
      continue;
    }

    let incremento = 0;
    switch (m.tipo) {
      case 'atividades':    incremento = 1; break;
      case 'matematica':    incremento = IDS_MATEMATICA.includes(idLicao) ? 1 : 0; break;
      case 'alfabetizacao': incremento = IDS_ALFABETIZACAO.includes(idLicao) ? 1 : 0; break;
      case 'historias':     incremento = IDS_HISTORIAS.includes(idLicao) ? 1 : 0; break;
      case 'perfeito':      incremento = reward.perfeito ? 1 : 0; break;
      case 'streak':        incremento = streakSubiu ? 1 : 0; break;
      case 'variedade':
        // progresso = número de trilhas distintas jogadas hoje
        incremento = 0; // atualiza diretamente abaixo
        m.progresso = trilhasJogadas.size;
        break;
    }

    if (m.tipo !== 'variedade') m.progresso += incremento;
    const progrediu = incremento > 0 || (m.tipo === 'variedade' && trilhasJogadas.size > (m.progresso - 1));
    const acabouDeCompletar = !m.concluida && m.progresso >= m.meta;

    if (acabouDeCompletar) m.concluida = true;

    resultados.push({
      mission: m,
      progrediu: m.tipo === 'variedade' ? trilhasJogadas.size > 0 : incremento > 0,
      acabouDeCompletar,
      recompensaGanha: acabouDeCompletar ? m.recompensa : undefined,
    });
  }

  await salvarMissoes(idUsuario, missoes);
  return resultados;
}

// ─── Coleta recompensa de missão concluída ────────────────────────────────────
export async function coletarRecompensaMissao(idUsuario: number, missionId: string): Promise<MissionProgress | null> {
  const missoes = await obterMissoesHoje(idUsuario);
  const m = missoes.find(x => x.id === missionId);
  if (!m || !m.concluida || m.recompensaColetada) return null;
  m.recompensaColetada = true;
  await salvarMissoes(idUsuario, missoes);
  return m;
}
