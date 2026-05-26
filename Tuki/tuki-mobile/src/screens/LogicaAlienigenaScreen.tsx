import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Alien types ────────────────────────────────────────────────────────────
interface AlienType {
  emoji: string;
  color: string;
  name: string;
}

const ALIENS: AlienType[] = [
  { emoji: '👽', color: '#22c55e', name: 'Verde' },
  { emoji: '👾', color: '#a855f7', name: 'Roxo' },
  { emoji: '🛸', color: '#3b82f6', name: 'Azul' },
  { emoji: '🤖', color: '#f97316', name: 'Laranja' },
  { emoji: '🌟', color: '#eab308', name: 'Dourado' },
];

// ─── Challenges ─────────────────────────────────────────────────────────────
interface Challenge {
  pattern: number[]; // indices into ALIENS
  missingIndex: number; // which position is missing
  options: number[]; // alien indices to choose from
  answer: number; // correct alien index
}

const CHALLENGES: Challenge[] = [
  // Pattern: Verde, Roxo, Verde, Roxo, ? → Roxo? Nope → Verde
  { pattern: [0, 1, 0, 1, 0], missingIndex: 4, options: [0, 1, 2], answer: 0 },
  // Pattern: Azul, Azul, Laranja, Azul, Azul, ? → Laranja
  { pattern: [2, 2, 3, 2, 2, 3], missingIndex: 5, options: [2, 3, 0], answer: 3 },
  // Pattern: Verde, Roxo, Azul, Verde, Roxo, ? → Azul
  { pattern: [0, 1, 2, 0, 1, 2], missingIndex: 5, options: [0, 1, 2], answer: 2 },
  // Pattern: Dourado, Laranja, Dourado, Laranja, ? → Dourado
  { pattern: [4, 3, 4, 3, 4], missingIndex: 4, options: [4, 3, 1], answer: 4 },
  // Pattern: Roxo, Verde, Verde, Roxo, Verde, ? → Verde
  { pattern: [1, 0, 0, 1, 0, 0], missingIndex: 5, options: [1, 0, 2], answer: 0 },
];

export default function LogicaAlienigenaScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const challenge = CHALLENGES[currentIndex];

  useEffect(() => {
    if (isFinished) {
      playSound('victory');
      const salvar = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            await registrarProgresso({
              idUsuario: perfil.id,
              idLicao: 35,
              pontuacao: CHALLENGES.length,
              tentativas: 1,
              concluida: true,
            });
            const atualizado = await buscarUsuarioPorId(perfil.id);
            await salvarPerfilAtivo(atualizado);
          }
        } catch (e) {
          console.error(e);
        }
      };
      salvar();
    }
  }, [isFinished]);

  const handleSelect = (alienIdx: number) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedAnswer(alienIdx);

    if (alienIdx === challenge.answer) {
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowFeedback('correct');
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedAnswer(null);
        if (currentIndex < CHALLENGES.length - 1) {
          setCurrentIndex((i) => i + 1);
          setDisabled(false);
        } else {
          setIsFinished(true);
        }
      }, 1800);
    } else {
      playSound('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowFeedback('wrong');
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedAnswer(null);
        setDisabled(false);
      }, 1200);
    }
  };

  // ─── Finished Screen ────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <SafeAreaView style={styles.finishedSafeArea}>
        <ConfettiEffect />
        <View style={styles.finishedContainer}>
          <Image
            source={require('../../assets/images/happy-tuki.png')}
            style={styles.finishedMascot}
            resizeMode="contain"
          />
          <Text style={styles.finishedTitle}>Genial!</Text>
          <Text style={styles.finishedSubtitle}>
            Você decifrou toda a lógica alienígena! 👾🧠
          </Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => {
              playSound('click');
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            playSound('click');
            router.back();
          }}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lógica Alienígena</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{CHALLENGES.length}
          </Text>
        </View>
      </View>

      {/* Instruction */}
      <Animated.View entering={FadeIn} style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Complete a sequência! Quem vem depois?
        </Text>
      </Animated.View>

      {/* Pattern display */}
      <View style={styles.patternContainer}>
        <Animated.View
          entering={FadeIn}
          key={`pattern-${currentIndex}`}
          style={styles.patternRow}
        >
          {challenge.pattern.map((alienIdx, idx) => {
            const isMissing = idx === challenge.missingIndex;
            const alien = ALIENS[alienIdx];
            const isRevealed =
              isMissing && showFeedback === 'correct' && selectedAnswer === challenge.answer;

            return (
              <PatternSlot
                key={`${currentIndex}-${idx}`}
                alien={alien}
                isMissing={isMissing}
                isRevealed={isRevealed}
                index={idx}
                showCorrectDance={showFeedback === 'correct' && !isMissing}
                showWrongShake={showFeedback === 'wrong' && !isMissing}
              />
            );
          })}
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Escolha o alienígena certo:</Text>
        <View style={styles.optionsRow}>
          {challenge.options.map((alienIdx) => {
            const alien = ALIENS[alienIdx];
            const isSelected = selectedAnswer === alienIdx;
            const isCorrectChoice =
              isSelected && showFeedback === 'correct';
            const isWrongChoice =
              isSelected && showFeedback === 'wrong';

            return (
              <OptionButton
                key={`opt-${currentIndex}-${alienIdx}`}
                alien={alien}
                alienIdx={alienIdx}
                onSelect={handleSelect}
                isCorrect={isCorrectChoice}
                isWrong={isWrongChoice}
                disabled={disabled}
              />
            );
          })}
        </View>
      </View>

      {/* Feedback Banner */}
      {showFeedback && (
        <Animated.View
          entering={BounceIn}
          style={[
            styles.feedbackBanner,
            showFeedback === 'correct'
              ? styles.feedbackCorrect
              : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>
            {showFeedback === 'correct'
              ? '🎉 Os alienígenas estão dançando!'
              : '😔 Tente novamente!'}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Pattern Slot Component ─────────────────────────────────────────────────
function PatternSlot({
  alien,
  isMissing,
  isRevealed,
  index,
  showCorrectDance,
  showWrongShake,
}: {
  alien: AlienType;
  isMissing: boolean;
  isRevealed: boolean;
  index: number;
  showCorrectDance: boolean;
  showWrongShake: boolean;
}) {
  const dance = useSharedValue(0);
  const shake = useSharedValue(0);
  const bob = useSharedValue(0);

  // Idle bob animation
  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withDelay(
          index * 100,
          withTiming(6, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Dance animation on correct
  useEffect(() => {
    if (showCorrectDance) {
      dance.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 100 }),
          withTiming(15, { duration: 100 }),
          withTiming(-15, { duration: 100 }),
          withTiming(15, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        2,
        false
      );
    }
  }, [showCorrectDance]);

  // Shake on wrong
  useEffect(() => {
    if (showWrongShake) {
      shake.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-8, { duration: 80 }),
        withTiming(0, { duration: 80 })
      );
    }
  }, [showWrongShake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value + dance.value },
      { translateX: shake.value },
      { rotate: `${dance.value}deg` },
    ],
  }));

  if (isMissing && !isRevealed) {
    return (
      <View style={[styles.patternSlot, styles.missingSlot]}>
        <Text style={styles.missingText}>?</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.patternSlot,
        { backgroundColor: alien.color + '30', borderColor: alien.color },
        animStyle,
        isRevealed && styles.revealedSlot,
      ]}
    >
      <Text style={styles.alienEmoji}>{alien.emoji}</Text>
    </Animated.View>
  );
}

// ─── Option Button ──────────────────────────────────────────────────────────
function OptionButton({
  alien,
  alienIdx,
  onSelect,
  isCorrect,
  isWrong,
  disabled,
}: {
  alien: AlienType;
  alienIdx: number;
  onSelect: (idx: number) => void;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (isCorrect) {
      scale.value = withSequence(withSpring(1.2), withSpring(1.05));
    }
    if (isWrong) {
      shake.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-10, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      scale.value = withSequence(withSpring(0.85), withSpring(1));
    }
  }, [isCorrect, isWrong]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => {
        scale.value = withSequence(withSpring(0.9), withSpring(1));
        onSelect(alienIdx);
      }}
    >
      <Animated.View
        style={[
          styles.optionButton,
          { backgroundColor: alien.color + '25', borderColor: alien.color },
          isCorrect && { backgroundColor: '#22c55e40', borderColor: '#22c55e' },
          isWrong && { backgroundColor: '#ef444440', borderColor: '#ef4444' },
          animStyle,
        ]}
      >
        <Text style={styles.optionEmoji}>{alien.emoji}</Text>
        <Text style={[styles.optionName, { color: alien.color }]}>{alien.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0a2a' },

  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1452',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: { color: '#c084fc', fontWeight: 'bold', fontSize: 16 },

  instructionContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  instructionText: {
    color: '#e0e7ff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: '#a855f7',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Pattern
  patternContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  patternSlot: {
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  missingSlot: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#fbbf24',
    borderStyle: 'dashed',
  },
  revealedSlot: {
    borderColor: '#22c55e',
    borderWidth: 3,
  },
  missingText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fbbf24',
  },
  alienEmoji: {
    fontSize: 28,
  },

  // Options
  optionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },
  optionsTitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  optionButton: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.28,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  optionName: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Feedback
  feedbackBanner: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  feedbackCorrect: {
    backgroundColor: '#052e16',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  feedbackWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Finished
  finishedSafeArea: { flex: 1, backgroundColor: '#0c0a2a' },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  finishedMascot: {
    width: '70%',
    height: Dimensions.get('window').height * 0.32,
    marginBottom: 20,
  },
  finishedTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#c084fc',
    marginBottom: 10,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 20,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 28,
  },
  backButtonLarge: {
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
  },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
