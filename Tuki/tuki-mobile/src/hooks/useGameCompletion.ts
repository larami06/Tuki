import { useState, useCallback } from 'react';
import { calcularRecompensa, type GameReward } from '../services/rewards';
import { atualizarMissoes, type MissionCompletion } from '../services/missions';
import { obterPerfilAtivo, salvarPerfilAtivo, atualizarStreak, adicionarRubis, obterRubis, type StreakInfo } from '../services/storage';
import { registrarProgresso, atualizarInventario, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';

export interface GameCompletionState {
  reward: GameReward;
  streak: StreakInfo;
  missions: MissionCompletion[];
  rubisTotal: number;
}

export function useGameCompletion(idLicao: number) {
  const [completionState, setCompletionState] = useState<GameCompletionState | null>(null);

  const completeGame = useCallback(async (acertos: number, total: number) => {
    playSound('victory');

    const reward = calcularRecompensa(idLicao, acertos, total);

    try {
      const perfil = await obterPerfilAtivo();
      if (!perfil) { setCompletionState({ reward, streak: { streakNovo: 1, subiu: false, resetou: false }, missions: [], rubisTotal: 0 }); return; }

      // Streak
      const streak = await atualizarStreak(perfil.id);

      // Rubis (local)
      const rubisTotal = await adicionarRubis(perfil.id, reward.rubis);

      // Novos valores de inventário
      const novasMoedas   = (perfil.moedas   || 0) + reward.moedas;
      const novasEstrelas = (perfil.estrelas  || 0) + reward.estrelas;
      const novoXP        = (perfil.xp        || 0) + reward.xp;

      // Registra progresso + atualiza servidor (em paralelo)
      await Promise.all([
        registrarProgresso({ idUsuario: perfil.id, idLicao, pontuacao: acertos, tentativas: 1, concluida: true }),
        atualizarInventario(perfil.id, novasMoedas, novasEstrelas, novoXP),
      ]);

      // Busca perfil atualizado e mesclado
      const atualizado = await buscarUsuarioPorId(perfil.id);
      await salvarPerfilAtivo({ ...atualizado, streakAtual: streak.streakNovo, rubis: rubisTotal });

      // Missões (após streak estar calculado)
      const missions = await atualizarMissoes(perfil.id, idLicao, reward, streak.subiu);

      // Coleta recompensas de missões concluídas agora
      for (const m of missions.filter(m => m.acabouDeCompletar && m.recompensaGanha)) {
        const r = m.recompensaGanha!;
        const mMoedas   = novasMoedas   + (r.moedas   || 0);
        const mEstrelas = novasEstrelas + (r.estrelas  || 0);
        const mXP       = novoXP        + (r.xp        || 0);
        if (r.rubis) await adicionarRubis(perfil.id, r.rubis);
        await atualizarInventario(perfil.id, mMoedas, mEstrelas, mXP);
      }

      setCompletionState({ reward, streak, missions, rubisTotal });
    } catch (e) {
      console.error('Erro ao finalizar jogo:', e);
      setCompletionState({ reward, streak: { streakNovo: 1, subiu: false, resetou: false }, missions: [], rubisTotal: 0 });
    }
  }, [idLicao]);

  const resetCompletion = useCallback(() => setCompletionState(null), []);

  return { completionState, completeGame, resetCompletion };
}
