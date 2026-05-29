import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterMissoesHoje, atualizarMissoes } from '../../services/missions';
import type { GameReward } from '../../services/rewards';

const REWARD_PERFEITO: GameReward = { moedas: 20, estrelas: 5, xp: 25, rubis: 0, perfeito: true };
const REWARD_NORMAL:   GameReward = { moedas: 15, estrelas: 4, xp: 20, rubis: 0, perfeito: false };
const REWARD_RUBYWIN:  GameReward = { moedas: 50, estrelas: 15, xp: 50, rubis: 2, perfeito: true };

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ────────────────────────────────────────────────────────────────
// Missões do dia
// ────────────────────────────────────────────────────────────────
describe('obterMissoesHoje', () => {
  it('cria exatamente 3 missões para o dia', async () => {
    const missoes = await obterMissoesHoje(1);
    expect(missoes).toHaveLength(3);
  });

  it('missões são persistidas — segunda chamada retorna as mesmas', async () => {
    const primeira = await obterMissoesHoje(1);
    const segunda  = await obterMissoesHoje(1);
    expect(primeira.map(m => m.id)).toEqual(segunda.map(m => m.id));
  });

  it('missões de usuários diferentes podem ser diferentes', async () => {
    const u1 = await obterMissoesHoje(1);
    const u2 = await obterMissoesHoje(2);
    // Não precisam ser iguais (hash de data pode ser diferente por id)
    expect(u1).toHaveLength(3);
    expect(u2).toHaveLength(3);
  });

  it('todas as missões começam com progresso 0 e não concluídas', async () => {
    const missoes = await obterMissoesHoje(1);
    missoes.forEach(m => {
      expect(m.progresso).toBe(0);
      expect(m.concluida).toBe(false);
      expect(m.recompensaColetada).toBe(false);
    });
  });

  it('cada missão tem id, titulo, meta, tipo e recompensa definidos', async () => {
    const missoes = await obterMissoesHoje(1);
    missoes.forEach(m => {
      expect(m.id).toBeTruthy();
      expect(m.titulo).toBeTruthy();
      expect(m.meta).toBeGreaterThan(0);
      expect(m.tipo).toBeTruthy();
      expect(m.recompensa).toBeDefined();
    });
  });
});

// ────────────────────────────────────────────────────────────────
// atualizarMissoes — progresso
// ────────────────────────────────────────────────────────────────
describe('atualizarMissoes — progressão por tipo', () => {
  it('qualquer jogo incrementa missões do tipo "atividades"', async () => {
    const antes = await obterMissoesHoje(10);
    const atividadeMission = antes.find(m => m.tipo === 'atividades');
    if (!atividadeMission) return; // pode não estar no set de hoje

    await atualizarMissoes(10, 1, REWARD_NORMAL, false);
    const depois = await obterMissoesHoje(10);
    const depois_m = depois.find(m => m.id === atividadeMission.id)!;
    expect(depois_m.progresso).toBeGreaterThan(0);
  });

  it('jogo de matemática (idLicao=30) não incrementa missão de alfabetização', async () => {
    // Força missão de alfabetização em branco
    const chave = `@tuki_missoes_20_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'alfabetizacao_2', titulo: 'Leitor!', descricao: '', meta: 2, tipo: 'alfabetizacao', recompensa: { moedas: 40 }, progresso: 0, concluida: false, recompensaColetada: false },
    ]));

    await atualizarMissoes(20, 30, REWARD_NORMAL, false); // Math lesson
    const depois = await obterMissoesHoje(20);
    const m = depois.find(m => m.tipo === 'alfabetizacao');
    if (m) expect(m.progresso).toBe(0);
  });

  it('jogo perfeito incrementa missão do tipo "perfeito"', async () => {
    const chave = `@tuki_missoes_30_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'perfeito_1', titulo: 'Nota 10!', descricao: '', meta: 1, tipo: 'perfeito', recompensa: { rubis: 1 }, progresso: 0, concluida: false, recompensaColetada: false },
    ]));

    const resultados = await atualizarMissoes(30, 34, REWARD_PERFEITO, false);
    const m = resultados.find(r => r.mission.id === 'perfeito_1');
    expect(m?.progrediu).toBe(true);
  });

  it('jogo não-perfeito NÃO incrementa missão do tipo "perfeito"', async () => {
    const chave = `@tuki_missoes_31_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'perfeito_1', titulo: 'Nota 10!', descricao: '', meta: 1, tipo: 'perfeito', recompensa: { rubis: 1 }, progresso: 0, concluida: false, recompensaColetada: false },
    ]));

    const resultados = await atualizarMissoes(31, 34, REWARD_NORMAL, false);
    const m = resultados.find(r => r.mission.id === 'perfeito_1');
    expect(m?.progrediu).toBe(false);
  });

  it('streak subindo incrementa missão do tipo "streak"', async () => {
    const chave = `@tuki_missoes_40_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'streak_hoje', titulo: 'Consistente!', descricao: '', meta: 1, tipo: 'streak', recompensa: { estrelas: 15 }, progresso: 0, concluida: false, recompensaColetada: false },
    ]));

    const resultados = await atualizarMissoes(40, 1, REWARD_NORMAL, true); // streakSubiu=true
    const m = resultados.find(r => r.mission.id === 'streak_hoje');
    expect(m?.progrediu).toBe(true);
  });

  it('missão já concluída não incrementa mais', async () => {
    const chave = `@tuki_missoes_50_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'complete_3', titulo: 'Dia Produtivo!', descricao: '', meta: 3, tipo: 'atividades', recompensa: { moedas: 50 }, progresso: 3, concluida: true, recompensaColetada: false },
    ]));

    const resultados = await atualizarMissoes(50, 1, REWARD_NORMAL, false);
    const m = resultados.find(r => r.mission.id === 'complete_3');
    expect(m?.progrediu).toBe(false);
    expect(m?.mission.progresso).toBe(3);
  });

  it('quando progresso atinge meta, concluida muda para true', async () => {
    const chave = `@tuki_missoes_60_${new Date().toDateString()}`;
    await AsyncStorage.setItem(chave, JSON.stringify([
      { id: 'complete_3', titulo: 'Dia Produtivo!', descricao: '', meta: 3, tipo: 'atividades', recompensa: { moedas: 50 }, progresso: 2, concluida: false, recompensaColetada: false },
    ]));

    const resultados = await atualizarMissoes(60, 1, REWARD_NORMAL, false);
    const m = resultados.find(r => r.mission.id === 'complete_3');
    expect(m?.acabouDeCompletar).toBe(true);
    expect(m?.mission.concluida).toBe(true);
    expect(m?.recompensaGanha).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────
// Rotação diária
// ────────────────────────────────────────────────────────────────
describe('Rotação diária de missões', () => {
  it('o mesmo conjunto de 3 missões é retornado durante o mesmo dia', async () => {
    const m1 = await obterMissoesHoje(99);
    const m2 = await obterMissoesHoje(99);
    expect(m1.map(m => m.id)).toEqual(m2.map(m => m.id));
  });

  it('missões têm IDs únicos no conjunto do dia', async () => {
    const missoes = await obterMissoesHoje(1);
    const ids = missoes.map(m => m.id);
    expect(new Set(ids).size).toBe(3);
  });
});
