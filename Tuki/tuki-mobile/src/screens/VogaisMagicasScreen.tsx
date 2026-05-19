import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, BounceIn } from 'react-native-reanimated';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';
import { useEffect } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';

const CHALLENGES = [
  { word: 'BELHA', missing: 'A', emoji: '🐝', completeWord: 'ABELHA' },
  { word: 'LEFANTE', missing: 'E', emoji: '🐘', completeWord: 'ELEFANTE' },
  { word: 'LHA', missing: 'I', emoji: '🏝️', completeWord: 'ILHA' },
  { word: 'VELHA', missing: 'O', emoji: '🐑', completeWord: 'OVELHA' },
  { word: 'RSO', missing: 'U', emoji: '🐻', completeWord: 'URSO' },
];

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export default function VogaisMagicasScreen() {
  const router = useRouter();

  // Desafios ativos que estão sendo exibidos (muda na rodada de revisão)
  const [activeChallenges, setActiveChallenges] = useState<any[]>(CHALLENGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Controle de erros e modo revisão
  const [failedChallenges, setFailedChallenges] = useState<any[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showReviewMessage, setShowReviewMessage] = useState(false);

  const currentChallenge = activeChallenges[currentIndex] || { word: '', missing: '', emoji: '', completeWord: '' };
  // O jogo só termina quando acabam os desafios ativos E não há mais erros na revisão
  const isFinished = currentIndex >= activeChallenges.length && failedChallenges.length === 0;

  // Trata a transição para o modo de revisão de erros
  useEffect(() => {
    if (currentIndex >= activeChallenges.length && failedChallenges.length > 0) {
      setShowReviewMessage(true);
      const timer = setTimeout(() => {
        setActiveChallenges(failedChallenges);
        setCurrentIndex(0);
        setFailedChallenges([]);
        setIsReviewMode(true);
        setShowReviewMessage(false);
        setSelectedVowel(null);
        setShowResult(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, activeChallenges, failedChallenges]);

  // Salva o progresso quando o jogo é finalmente concluído com sucesso
  useEffect(() => {
    if (isFinished) {
      playSound('victory');
      const salvarProgresso = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            await registrarProgresso({
              idUsuario: perfil.id,
              idLicao: 1, // Vogais Mágicas
              pontuacao: score,
              tentativas: 1,
              concluida: true
            });
            // Atualiza o perfil ativo em cache para refletir na HomeScreen
            const perfilAtualizado = await buscarUsuarioPorId(perfil.id);
            await salvarPerfilAtivo(perfilAtualizado);
          }
        } catch (error) {
          console.error("Erro ao registrar progresso de Vogais Mágicas:", error);
        }
      };
      salvarProgresso();
    }
  }, [isFinished]);

  const handleSelectVowel = (vowel: string) => {
    if (showResult || showReviewMessage) return;

    setSelectedVowel(vowel);
    setShowResult(true);

    if (vowel === currentChallenge.missing) {
      playSound('correct');
      // Apenas computa pontos na primeira rodada padrão (não na revisão)
      if (!isReviewMode) {
        setScore(prev => prev + 1);
      }
    } else {
      playSound('wrong');
      // Se errou, adiciona aos desafios falhos para revisão posterior
      setFailedChallenges(prev => {
        if (prev.some(c => c.word === currentChallenge.word)) return prev;
        return [...prev, currentChallenge];
      });
    }

    setTimeout(() => {
      if (currentIndex < activeChallenges.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedVowel(null);
        setShowResult(false);
      } else {
        setCurrentIndex(prev => prev + 1); // Aciona o gatilho de fim / revisão
      }
    }, 2000);
  };

  if (showReviewMessage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.View entering={BounceIn} style={styles.reviewOverlay}>
          <Text style={styles.reviewEmoji}>🎯</Text>
          <Text style={styles.reviewTitle}>Vamos revisar!</Text>
          <Text style={styles.reviewSubtitle}>Vamos treinar os itens que você errou para ficar nota 10!</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <ConfettiEffect />
        <View style={styles.finishedContainer}>
          <Image source={require('../../assets/images/happy-tuki.png')} style={styles.finishedMascot} resizeMode="contain" />
          <Text style={styles.finishedTitle}>Parabéns!</Text>
          <Text style={styles.finishedSubtitle}>Você completou as Vogais Mágicas!</Text>
          
          <View style={styles.starsSummaryContainer}>
            <Text style={styles.scoreText}>Acertos: {score} de {CHALLENGES.length}</Text>
            <View style={styles.starsRewardBadge}>
              <Text style={styles.starsRewardText}>⭐ +{score * 3} Estrelas!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.backButtonLarge} onPress={() => { playSound('click'); router.back(); }}>
            <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vogais Mágicas</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{currentIndex + 1}/{activeChallenges.length}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          {isReviewMode ? "Vamos revisar de novo! 🌟" : "Encontre a primeira letra!"}
        </Text>

        <Animated.View entering={BounceIn} key={currentIndex} style={styles.challengeCard}>
          <Text style={styles.emoji}>{currentChallenge.emoji}</Text>
          <View style={styles.wordContainer}>
            <View style={[styles.letterBox, showResult && selectedVowel === currentChallenge.missing ? styles.correctLetterBox : (showResult && styles.wrongLetterBox)]}>
              <Text style={styles.missingLetterText}>
                {showResult ? selectedVowel : '?'}
              </Text>
            </View>
            <Text style={styles.wordText}>{currentChallenge.word}</Text>
          </View>
        </Animated.View>

        <View style={styles.vowelsContainer}>
          {VOWELS.map((vowel) => {
            const isSelected = selectedVowel === vowel;
            let buttonStyle: any = styles.vowelButton;
            let textStyle: any = styles.vowelText;

            if (showResult && isSelected) {
              buttonStyle = vowel === currentChallenge.missing
                ? [styles.vowelButton, styles.vowelButtonCorrect]
                : [styles.vowelButton, styles.vowelButtonWrong];
              textStyle = [styles.vowelText, { color: '#fff' }];
            } else if (showResult && vowel === currentChallenge.missing) {
              buttonStyle = [styles.vowelButton, styles.vowelButtonCorrectHint];
            }

            return (
              <TouchableOpacity
                key={vowel}
                style={buttonStyle}
                onPress={() => handleSelectVowel(vowel)}
                disabled={showResult}
              >
                <Text style={textStyle}>{vowel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showResult && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.feedbackContainer}>
            {selectedVowel === currentChallenge.missing ? (
              <>
                <CheckCircle size={40} color="#10b981" />
                <Text style={[styles.feedbackText, { color: '#10b981' }]}>
                  {isReviewMode ? "Muito bem! 🌟" : "Muito bem! +3 ⭐"}
                </Text>
              </>
            ) : (
              <>
                <XCircle size={40} color="#ef4444" />
                <Text style={[styles.feedbackText, { color: '#ef4444' }]}>Ops! Era a letra {currentChallenge.missing}</Text>
              </>
            )}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    backgroundColor: '#ff6b6b',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 40,
    textAlign: 'center',
  },
  challengeCard: {
    alignItems: 'center',
    marginBottom: 50,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterBox: {
    width: 50,
    height: 60,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderBottomWidth: 4,
  },
  correctLetterBox: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  wrongLetterBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  missingLetterText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#334155',
  },
  wordText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: 2,
  },
  vowelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  vowelButton: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderBottomWidth: 6,
    borderBottomColor: '#cbd5e1',
  },
  vowelButtonCorrect: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
    borderBottomColor: '#047857',
  },
  vowelButtonWrong: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    borderBottomColor: '#b91c1c',
  },
  vowelButtonCorrectHint: {
    borderColor: '#10b981',
    borderWidth: 3,
  },
  vowelText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#334155',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finishedMascot: {
    width: '70%',
    height: Dimensions.get('window').height * 0.32,
    marginBottom: 20,
  },
  finishedTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  finishedSubtitle: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 30,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 50,
  },
  backButtonLarge: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewOverlay: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 5,
    marginHorizontal: 20,
  },
  reviewEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3b82f6',
    marginBottom: 10,
    textAlign: 'center',
  },
  reviewSubtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  starsSummaryContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  starsRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  starsRewardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d97706',
  },
});
