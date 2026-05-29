import { useState, useCallback } from 'react';
import { calcularRecompensa, type GameReward } from '../services/rewards';
import { atualizarMissoes, type MissionCompletion } from '../services/missions';
import { obterPerfilAtivo, salvarPerfilAtivo, atualizarStreak, adicionarDiamantes, obterDiamantes, type StreakInfo } from '../services/storage';
import { registrarProgresso, atualizarInventario, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';

export interface GameCompletionState {
  reward: GameReward;
  streak: StreakInfo;
  missions: MissionCompletion[];
  diamantesTotal: number;
}

export function useGameCompletion(idLicao: number) {
  const [completionState, setCompletionState] = useState<GameCompletionState | null>(null);

  const completeGame = useCallback(async (acertos: number, total: number) => {
    playSound('victory');

    const reward = calcularRecompensa(idLicao, acertos, total);

    const perfil = await obterPerfilAtivo();
    if (!perfil) {
      setCompletionState({ reward, streak: { streakNovo: 1, subiu: false, resetou: false }, missions: [], diamantesTotal: 0 });
      return;
    }

    // ── Operações locais (rápidas, só AsyncStorage) ──────────────────────────
    const streak        = await atualizarStreak(perfil.id);
    const diamantesTotal = await adicionarDiamantes(perfil.id, reward.diamantes);
    const missions      = await atualizarMissoes(perfil.id, idLicao, reward, streak.subiu);

    // Mostra o modal imediatamente — sem esperar o servidor
    setCompletionState({ reward, streak, missions, diamantesTotal });

    // ── Sincronização com servidor em background (não bloqueia o modal) ──────
    const novasMoedas   = (perfil.moedas   || 0) + reward.moedas;
    const novasEstrelas = (perfil.estrelas  || 0) + reward.estrelas;
    const novoXP        = (perfil.xp        || 0) + reward.xp;

    Promise.all([
      registrarProgresso({ idUsuario: perfil.id, idLicao, pontuacao: acertos, tentativas: 1, concluida: true }),
      atualizarInventario(perfil.id, novasMoedas, novasEstrelas, novoXP),
    ])
      .then(async () => {
        const atualizado = await buscarUsuarioPorId(perfil.id);
        await salvarPerfilAtivo({ ...atualizado, streakAtual: streak.streakNovo, diamantes: diamantesTotal });

        // Recompensas extras de missões completadas
        for (const m of missions.filter(m => m.acabouDeCompletar && m.recompensaGanha)) {
          const r = m.recompensaGanha!;
          const mMoedas   = novasMoedas   + (r.moedas   || 0);
          const mEstrelas = novasEstrelas + (r.estrelas  || 0);
          const mXP       = novoXP        + (r.xp        || 0);
          if (r.diamantes) await adicionarDiamantes(perfil.id, r.diamantes);
          await atualizarInventario(perfil.id, mMoedas, mEstrelas, mXP);
        }
      })
      .catch(e => console.error('Erro ao sincronizar progresso com servidor:', e));
  }, [idLicao]);

  const resetCompletion = useCallback(() => setCompletionState(null), []);

  return { completionState, completeGame, resetCompletion };
}
