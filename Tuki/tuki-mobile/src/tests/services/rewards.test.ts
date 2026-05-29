import { describe, it, expect } from 'vitest';
import { calcularRecompensa, ROULETTE_SLICES } from '../../services/rewards';

// ────────────────────────────────────────────────────────────────
// Roleta
// ────────────────────────────────────────────────────────────────
describe('ROULETTE_SLICES', () => {
  it('deve ter exatamente 8 fatias', () => {
    expect(ROULETTE_SLICES).toHaveLength(8);
  });

  it('deve ter exatamente 1 fatia de rubi (raro)', () => {
    expect(ROULETTE_SLICES.filter(s => s.tipo === 'rubis')).toHaveLength(1);
  });

  it('deve ter exatamente 1 fatia de "nada"', () => {
    expect(ROULETTE_SLICES.filter(s => s.tipo === 'nada')).toHaveLength(1);
  });

  it('a fatia de rubi vale exatamente 1 ruby', () => {
    const rubySlice = ROULETTE_SLICES.find(s => s.tipo === 'rubis');
    expect(rubySlice?.valor).toBe(1);
  });

  it('todas as fatias têm color definido', () => {
    ROULETTE_SLICES.forEach(s => expect(s.color).toBeTruthy());
  });

  it('moedas somam 170 (20+50+100) garantindo boa recompensa média', () => {
    const totalMoedas = ROULETTE_SLICES.filter(s => s.tipo === 'moedas').reduce((acc, s) => acc + s.valor, 0);
    expect(totalMoedas).toBe(170);
  });
});

// ────────────────────────────────────────────────────────────────
// calcularRecompensa
// ────────────────────────────────────────────────────────────────
describe('calcularRecompensa — balanceamento', () => {
  it('jogo perfeito (5/5) retorna mais recompensa que jogo com erros (3/5)', () => {
    const perfeito = calcularRecompensa(1, 5, 5);
    const comErros = calcularRecompensa(1, 3, 5);
    expect(perfeito.moedas).toBeGreaterThan(comErros.moedas);
    expect(perfeito.xp).toBeGreaterThan(comErros.xp);
  });

  it('jogo perfeito sinaliza perfeito=true', () => {
    const r = calcularRecompensa(34, 4, 4);
    expect(r.perfeito).toBe(true);
  });

  it('jogo incompleto (3/4) sinaliza perfeito=false', () => {
    const r = calcularRecompensa(34, 3, 4);
    expect(r.perfeito).toBe(false);
  });

  it('jogo perfeito em lição avançada concede rubis', () => {
    const r = calcularRecompensa(36, 4, 4); // Mestre da Galáxia
    expect(r.rubis).toBe(2);
  });

  it('jogo perfeito em lição básica NÃO concede rubis', () => {
    const r = calcularRecompensa(1, 5, 5); // Vogais Mágicas (sem perfeito config)
    expect(r.rubis).toBe(0);
  });

  it('ratio mínimo de 0.4 garante recompensa mesmo com muitos erros', () => {
    const ruim = calcularRecompensa(30, 1, 5); // 20% de acerto
    expect(ruim.moedas).toBeGreaterThan(0);
    expect(ruim.xp).toBeGreaterThan(0);
  });

  it('lições avançadas dão mais recompensa que lições básicas', () => {
    const basica   = calcularRecompensa(1,  5, 5);  // Vogais Mágicas
    const avancada = calcularRecompensa(36, 4, 4);  // Mestre da Galáxia
    expect(avancada.moedas).toBeGreaterThan(basica.moedas);
    expect(avancada.xp).toBeGreaterThan(basica.xp);
  });

  it('recompensa base de lição desconhecida usa fallback sem explodir', () => {
    const r = calcularRecompensa(999, 1, 1);
    expect(r.moedas).toBeGreaterThan(0);
    expect(r.xp).toBeGreaterThan(0);
  });

  it('lição com rubi perfeito (idLicao=7) dá 1 ruby ao completar sem erros', () => {
    const r = calcularRecompensa(7, 1, 1);
    expect(r.rubis).toBe(1);
  });

  it('lição com rubi (idLicao=35) não dá rubi se houve erros', () => {
    const r = calcularRecompensa(35, 4, 5); // 80% — não é perfeito
    expect(r.rubis).toBe(0);
  });

  it('todas as lições 1-7, 20-26, 30-36 retornam valores positivos', () => {
    const allIds = [1,2,3,4,5,6,7, 20,21,22,23,24,25,26, 30,31,32,33,34,35,36];
    allIds.forEach(id => {
      const r = calcularRecompensa(id, 3, 3);
      expect(r.moedas,  `moedas para idLicao ${id}`).toBeGreaterThan(0);
      expect(r.estrelas, `estrelas para idLicao ${id}`).toBeGreaterThan(0);
      expect(r.xp,       `xp para idLicao ${id}`).toBeGreaterThan(0);
    });
  });
});
