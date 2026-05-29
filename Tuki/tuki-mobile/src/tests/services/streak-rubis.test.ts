import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atualizarStreak, obterRubis, adicionarRubis } from '../../services/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ────────────────────────────────────────────────────────────────
// STREAK
// ────────────────────────────────────────────────────────────────
describe('atualizarStreak', () => {
  it('primeira jogada de sempre começa streak em 1', async () => {
    const r = await atualizarStreak(1);
    expect(r.streakNovo).toBe(1);
    expect(r.subiu).toBe(true);
    expect(r.resetou).toBe(false);
  });

  it('jogar duas vezes no mesmo dia não incrementa streak', async () => {
    await atualizarStreak(1); // primeira jogada hoje
    const r = await atualizarStreak(1); // segunda jogada
    expect(r.streakNovo).toBe(1);
    expect(r.subiu).toBe(false);
  });

  it('jogar no dia seguinte incrementa o streak', async () => {
    const hoje  = new Date().toDateString();
    const ontem = new Date(Date.now() - 86_400_000).toDateString();

    // Simula que jogou ontem
    await AsyncStorage.setItem('@tuki_ultimo_jogo_5', ontem);
    await AsyncStorage.setItem('@tuki_streak_5', '3');

    const r = await atualizarStreak(5);
    expect(r.streakNovo).toBe(4);
    expect(r.subiu).toBe(true);
    expect(r.resetou).toBe(false);
  });

  it('após 2 dias sem jogar, streak reseta para 1 e resetou=true', async () => {
    const anteontem = new Date(Date.now() - 2 * 86_400_000).toDateString();
    await AsyncStorage.setItem('@tuki_ultimo_jogo_7', anteontem);
    await AsyncStorage.setItem('@tuki_streak_7', '10');

    const r = await atualizarStreak(7);
    expect(r.streakNovo).toBe(1);
    expect(r.resetou).toBe(true);
    expect(r.subiu).toBe(true);
  });

  it('streaks de usuários diferentes são independentes', async () => {
    await atualizarStreak(1); // usuário 1 joga hoje
    const r2 = await atualizarStreak(2); // usuário 2 nunca jogou
    expect(r2.streakNovo).toBe(1); // começa do zero
  });

  it('persiste o streak corretamente no AsyncStorage', async () => {
    await atualizarStreak(10);
    const stored = await AsyncStorage.getItem('@tuki_streak_10');
    expect(stored).toBe('1');

    const diaKey = await AsyncStorage.getItem('@tuki_ultimo_jogo_10');
    expect(diaKey).toBe(new Date().toDateString());
  });

  it('streak de 30 dias incrementa para 31 corretamente', async () => {
    const ontem = new Date(Date.now() - 86_400_000).toDateString();
    await AsyncStorage.setItem('@tuki_ultimo_jogo_3', ontem);
    await AsyncStorage.setItem('@tuki_streak_3', '30');

    const r = await atualizarStreak(3);
    expect(r.streakNovo).toBe(31);
  });
});

// ────────────────────────────────────────────────────────────────
// RUBIS
// ────────────────────────────────────────────────────────────────
describe('obterRubis / adicionarRubis', () => {
  it('retorna 0 quando não há rubis salvos', async () => {
    const r = await obterRubis(1);
    expect(r).toBe(0);
  });

  it('adiciona rubis corretamente e retorna o novo total', async () => {
    const total = await adicionarRubis(1, 2);
    expect(total).toBe(2);
  });

  it('acumula rubis em múltiplas chamadas', async () => {
    await adicionarRubis(1, 1);
    await adicionarRubis(1, 1);
    const total = await adicionarRubis(1, 1);
    expect(total).toBe(3);
  });

  it('rubis de usuários diferentes são isolados', async () => {
    await adicionarRubis(1, 5);
    await adicionarRubis(2, 2);

    expect(await obterRubis(1)).toBe(5);
    expect(await obterRubis(2)).toBe(2);
  });

  it('ganhar 0 rubis não altera o total', async () => {
    await adicionarRubis(1, 3);
    const total = await adicionarRubis(1, 0);
    expect(total).toBe(3);
  });
});
