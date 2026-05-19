import { Audio } from 'expo-av';

export const playSound = async (type: 'click' | 'correct' | 'wrong' | 'victory') => {
  try {
    let soundToPlay: Audio.Sound | null = null;

    if (type === 'click') {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/som-botao.wav')
      );
      soundToPlay = sound;
    } else if (type === 'correct') {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/resposta-certa.wav')
      );
      soundToPlay = sound;
    } else if (type === 'wrong') {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/resposta-errada.mp3')
      );
      soundToPlay = sound;
    } else if (type === 'victory') {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/proximo-nivel.wav')
      );
      soundToPlay = sound;
    }

    if (soundToPlay) {
      await soundToPlay.playAsync();
      
      // Libera o áudio da memória assim que terminar de tocar para otimizar desempenho
      soundToPlay.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await soundToPlay?.unloadAsync();
        }
      });
    }
  } catch (error) {
    console.error(`Erro ao tocar áudio (${type}):`, error);
  }
};
