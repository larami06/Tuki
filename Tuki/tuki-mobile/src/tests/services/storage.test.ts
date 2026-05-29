import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  salvarResponsavel,
  obterResponsavel,
  salvarPerfilAtivo,
  obterPerfilAtivo,
  logout,
  salvarUltimoDesafio,
  verificarJogouHoje,
  salvarAtividadeConcluida,
  obterAtividadesConcluidas,
} from '../../services/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ────────────────────────────────────────────────────────────────
// Responsável
// ────────────────────────────────────────────────────────────────
describe('salvarResponsavel / obterResponsavel', () => {
  it('salva e recupera dados do responsável corretamente', async () => {
    const responsavel = { id: 1, email: 'pai@email.com' };
    await salvarResponsavel(responsavel);

    const result = await obterResponsavel();
    expect(result).toEqual(responsavel);
  });

  it('retorna null quando não há responsável salvo', async () => {
    const result = await obterResponsavel();
    expect(result).toBeNull();
  });

  it('sobrescreve dados ao salvar novamente', async () => {
    await salvarResponsavel({ id: 1, email: 'antigo@email.com' });
    await salvarResponsavel({ id: 2, email: 'novo@email.com' });

    const result = await obterResponsavel();
    expect(result.email).toBe('novo@email.com');
  });
});

// ────────────────────────────────────────────────────────────────
// Perfil Ativo (Criança)
// ────────────────────────────────────────────────────────────────
describe('salvarPerfilAtivo / obterPerfilAtivo', () => {
  it('persiste o perfil da criança no storage', async () => {
    const perfil = { id: 42, nick: 'Tuki', moedas: 150, estrelas: 5, streakAtual: 3, xp: 200 };
    await salvarPerfilAtivo(perfil);

    const result = await obterPerfilAtivo();
    expect(result).toEqual(perfil);
  });

  it('retorna null quando não há perfil ativo', async () => {
    const result = await obterPerfilAtivo();
    expect(result).toBeNull();
  });

  it('preserva todos os campos do perfil (moedas, estrelas, xp)', async () => {
    const perfil = { id: 7, nick: 'Ana', moedas: 300, estrelas: 12, streakAtual: 7, xp: 500 };
    await salvarPerfilAtivo(perfil);

    const result = await obterPerfilAtivo();
    expect(result.moedas).toBe(300);
    expect(result.estrelas).toBe(12);
    expect(result.xp).toBe(500);
  });
});

// ────────────────────────────────────────────────────────────────
// Logout
// ────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('remove responsável e perfil ativo do storage', async () => {
    await salvarResponsavel({ id: 1, email: 'mae@email.com' });
    await salvarPerfilAtivo({ id: 5, nick: 'Pedro', moedas: 0, estrelas: 0, streakAtual: 0, xp: 0 });

    await logout();

    expect(await obterResponsavel()).toBeNull();
    expect(await obterPerfilAtivo()).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────
// Desafio do Dia
// ────────────────────────────────────────────────────────────────
describe('salvarUltimoDesafio / verificarJogouHoje', () => {
  it('retorna false quando a criança ainda não jogou hoje', async () => {
    const jogou = await verificarJogouHoje(10);
    expect(jogou).toBe(false);
  });

  it('retorna true após salvar o desafio do dia de hoje', async () => {
    await salvarUltimoDesafio(10);
    const jogou = await verificarJogouHoje(10);
    expect(jogou).toBe(true);
  });

  it('usa chave separada por idUsuario (perfis distintos não se interferem)', async () => {
    await salvarUltimoDesafio(1);

    expect(await verificarJogouHoje(1)).toBe(true);
    expect(await verificarJogouHoje(2)).toBe(false);
  });

  it('persiste a data atual no formato toDateString', async () => {
    await salvarUltimoDesafio(5);
    const key = '@tuki_ultimo_desafio_5';
    const stored = await AsyncStorage.getItem(key);
    expect(stored).toBe(new Date().toDateString());
  });
});

// ────────────────────────────────────────────────────────────────
// Progresso de Alfabetização
// ────────────────────────────────────────────────────────────────
describe('salvarAtividadeConcluida / obterAtividadesConcluidas', () => {
  it('retorna lista vazia quando não há atividades concluídas', async () => {
    await salvarPerfilAtivo({ id: 1 });
    const result = await obterAtividadesConcluidas();
    expect(result).toEqual([]);
  });

  it('adiciona uma atividade concluída corretamente', async () => {
    await salvarPerfilAtivo({ id: 1 });
    await salvarAtividadeConcluida(1);

    const result = await obterAtividadesConcluidas();
    expect(result).toContain(1);
  });

  it('não duplica uma atividade se salva duas vezes', async () => {
    await salvarPerfilAtivo({ id: 1 });
    await salvarAtividadeConcluida(3);
    await salvarAtividadeConcluida(3);

    const result = await obterAtividadesConcluidas();
    expect(result.filter((id: number) => id === 3)).toHaveLength(1);
  });

  it('acumula múltiplas atividades concluídas', async () => {
    await salvarPerfilAtivo({ id: 1 });
    await salvarAtividadeConcluida(1);
    await salvarAtividadeConcluida(2);
    await salvarAtividadeConcluida(3);

    const result = await obterAtividadesConcluidas();
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3]));
  });
});
