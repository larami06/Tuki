import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Star } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
  BounceIn,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── WORD DATA ────────────────────────────────────────────────────────────────
interface WordChallenge {
  word: string;
  syllables: string[];
  emoji: string;
  distractors: string[];
}

const WORD_CHALLENGES: WordChallenge[] = [
  { word: 'BOLA', syllables: ['BO', 'LA'], emoji: '⚽', distractors: ['CA', 'TU'] },
  { word: 'GATO', syllables: ['GA', 'TO'], emoji: '🐱', distractors: ['PE', 'LU'] },
  { word: 'SAPO', syllables: ['SA', 'PO'], emoji: '🐸', distractors: ['BI', 'NE'] },
  { word: 'PATO', syllables: ['PA', 'TO'], emoji: '🦆', distractors: ['FI', 'RU'] },
  { word: 'VACA', syllables: ['VA', 'CA'], emoji: '🐄', distractors: ['LO', 'TI'] },
  { word: 'MALA', syllables: ['MA', 'LA'], emoji: '🧳', distractors: ['FU', 'RE'] },
  { word: 'FOCA', syllables: ['FO', 'CA'], emoji: '🦭', distractors: ['BI', 'TU'] },
  { word: 'LUVA', syllables: ['LU', 'VA'], emoji: '🧤', distractors: ['PO', 'NE'] },
];

// ─── COLORS ───────────────────────────────────────────────────────────────────
const BUBBLE_COLORS = ['#ff6b6b', '#4ecdc4', '#f72585', '#7209b7', '#ffd166', '#06d6a0'];

// ─── LAYOUT CONSTANTS (all relative to gameArea) ─────────────────────────────
const HEADER_HEIGHT = 130; // header + progress bar approximate height
const SLOT_WIDTH = 80;
const SLOT_HEIGHT = 56;
const SLOT_GAP = 16;
const SLOTS_TOTAL_WIDTH = SLOT_WIDTH * 2 + SLOT_GAP;
const SLOT_START_X = (SCREEN_WIDTH - SLOTS_TOTAL_WIDTH) / 2;
// Slots position relative to gameArea
const SLOT_Y_IN_GAME = 180; // below emoji area

const BUBBLE_SIZE = 70;
// Bubbles position relative to gameArea
const BUBBLES_Y_IN_GAME = SLOT_Y_IN_GAME + SLOT_HEIGHT + 200;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.min(255, Math.floor((R * (100 + percent)) / 100));
  G = Math.min(255, Math.floor((G * (100 + percent)) / 100));
  B = Math.min(255, Math.floor((B * (100 + percent)) / 100));
  return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ShortWordsScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(4);

  // Game state
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([null, null]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWordComplete, setShowWordComplete] = useState(false);

  const challenge = WORD_CHALLENGES[challengeIndex];
  const totalChallenges = WORD_CHALLENGES.length;

  // All syllables for current challenge (correct + distractors), shuffled
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);

  useEffect(() => {
    const all = [...challenge.syllables, ...challenge.distractors];
    setShuffledSyllables(shuffleArray(all));
    setFilledSlots([null, null]);
  }, [challengeIndex]);

  // Progress animation
  const progressPercent = useSharedValue(0);
  useEffect(() => {
    progressPercent.value = withSpring(challengeIndex / totalChallenges, { damping: 15 });
  }, [challengeIndex]);

  // Emoji bounce
  const emojiScale = useSharedValue(1);
  useEffect(() => {
    emojiScale.value = withSequence(
      withSpring(1.2, { damping: 4 }),
      withSpring(1, { damping: 8 })
    );
  }, [challengeIndex]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }] as any,
  }));

  // Handle syllable drop
  const handleDrop = useCallback(
    (syllable: string, slotIndex: number) => {
      const expectedSyllable = challenge.syllables[slotIndex];

      if (syllable === expectedSyllable) {
        // CORRECT!
        playSound('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const newSlots = [...filledSlots];
        newSlots[slotIndex] = syllable;
        setFilledSlots(newSlots);
        setScore((prev) => prev + 1);

        // Check if word is complete
        const otherIndex = slotIndex === 0 ? 1 : 0;
        if (newSlots[otherIndex] !== null) {
          // Word complete!
          setShowWordComplete(true);
          setShowCelebration(true);

          setTimeout(() => {
            setShowWordComplete(false);
            setShowCelebration(false);

            if (challengeIndex < totalChallenges - 1) {
              setChallengeIndex((prev) => prev + 1);
            } else {
              setIsFinished(true);
            }
          }, 2200);
        }

        return true; // correct
      } else {
        // WRONG
        playSound('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setAttempts((prev) => prev + 1);
        return false; // incorrect, will bounce back
      }
    },
    [filledSlots, challenge, challengeIndex, totalChallenges]
  );

  // Save progress on finish
  useEffect(() => {
    if (isFinished) {
      completeGame(score, WORD_CHALLENGES.length * 2);
    }
  }, [isFinished]);

  // Progress bar animated style
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressPercent.value * 100}%`,
  }));

  // Mascot message
  const getMascotMessage = () => {
    if (showWordComplete) {
      return `🎉 Muito bem! Você montou "${challenge.word}"! ${challenge.emoji}`;
    }
    const filled = filledSlots.filter((s) => s !== null).length;
    if (filled === 0) {
      return `Olá amiguinho! 🌳 Veja a imagem e arraste as sílabas certas para montar a palavra!`;
    }
    if (filled === 1) {
      return `Quase lá! Falta mais uma sílaba! 💪`;
    }
    return `Arraste as sílabas para os espaços! 📝`;
  };

  const handleReset = () => {
    playSound('click');
    setChallengeIndex(0);
    setFilledSlots([null, null]);
    setScore(0);
    setAttempts(0);
    setIsFinished(false);
    setShowCelebration(false);
    setShowWordComplete(false);
  };

  // ─── GAME SCREEN ──────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {showCelebration && <ConfettiEffect />}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              playSound('click');
              router.back();
            }}
            style={styles.backBtn}
          >
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Palavras Curtas</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBadge}>
            <Sparkles size={16} color="#fff" />
            <Text style={styles.resetBadgeText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressArea}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
          </View>
          <Text style={styles.progressText}>
            {challengeIndex + 1}/{totalChallenges}
          </Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {/* Word Image / Emoji Display */}
          <View style={styles.wordImageArea}>
            <Animated.View style={[styles.emojiContainer, emojiStyle]}>
              <Text style={styles.emojiText}>{challenge.emoji}</Text>
            </Animated.View>
            <Text style={styles.hintLabel}>O que é isso?</Text>
          </View>

          {/* Slots Area */}
          <View style={styles.slotsRow}>
            {challenge.syllables.map((_, slotIdx) => {
              const filled = filledSlots[slotIdx];
              return (
                <View key={slotIdx} style={styles.slotOuter}>
                  {filled ? (
                    <Animated.View entering={ZoomIn.duration(300)} style={styles.slotFilled}>
                      <View style={styles.slotGlow} />
                      <Text style={styles.slotFilledText}>{filled}</Text>
                    </Animated.View>
                  ) : (
                    <View style={styles.slotEmpty}>
                      <Text style={styles.slotEmptyText}>_</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Word Complete Banner */}
          {showWordComplete && (
            <Animated.View entering={BounceIn} style={styles.wordCompleteBanner}>
              <Text style={styles.wordCompleteText}>
                {challenge.emoji} {challenge.word}!
              </Text>
            </Animated.View>
          )}

          {/* Mascot Balloon */}
          <View style={styles.mascotArea}>
            <View style={styles.mascotBalloon}>
              <Text style={styles.mascotText}>{getMascotMessage()}</Text>
            </View>
          </View>

          {/* Syllable Bubbles */}
          <View style={styles.bubblesArea} pointerEvents="box-none">
            {shuffledSyllables.map((syllable, index) => {
              const isPlaced =
                filledSlots[0] === syllable || filledSlots[1] === syllable;

              // Only hide if it's a correct syllable already placed
              const isCorrectAndPlaced =
                isPlaced && challenge.syllables.includes(syllable);

              return (
                <SyllableBubble
                  key={`${challengeIndex}-${syllable}-${index}`}
                  syllable={syllable}
                  index={index}
                  totalBubbles={shuffledSyllables.length}
                  color={BUBBLE_COLORS[index % BUBBLE_COLORS.length]}
                  isHidden={isCorrectAndPlaced}
                  onDrop={handleDrop}
                  slotsInfo={challenge.syllables}
                  filledSlots={filledSlots}
                />
              );
            })}
          </View>
        </View>
      {completionState && (
        <GameCompletionModal state={completionState} onContinue={() => router.back()} />
      )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── SYLLABLE BUBBLE ──────────────────────────────────────────────────────────
interface SyllableBubbleProps {
  syllable: string;
  index: number;
  totalBubbles: number;
  color: string;
  isHidden: boolean;
  onDrop: (syllable: string, slotIndex: number) => boolean;
  slotsInfo: string[];
  filledSlots: (string | null)[];
}

function SyllableBubble({
  syllable,
  index,
  totalBubbles,
  color,
  isHidden,
  onDrop,
  slotsInfo,
  filledSlots,
}: SyllableBubbleProps) {
  // Calculate starting position
  const cols = Math.min(totalBubbles, 4);
  const gap = (SCREEN_WIDTH - cols * BUBBLE_SIZE) / (cols + 1);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const startX = gap + col * (BUBBLE_SIZE + gap);
  const startY = BUBBLES_Y_IN_GAME + row * (BUBBLE_SIZE + 16);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const bobOffset = useSharedValue(0);

  // Floating bob animation
  useEffect(() => {
    if (!isHidden) {
      bobOffset.value = withRepeat(
        withSequence(
          withTiming(6, {
            duration: 1400 + index * 150,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-6, {
            duration: 1400 + index * 150,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    } else {
      bobOffset.value = 0;
    }
  }, [isHidden]);

  // Reset position when hidden (placed)
  useEffect(() => {
    if (isHidden) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(0);
    }
  }, [isHidden]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      if (isHidden) return;
      scale.value = withSpring(1.2);
      // Pop sound on pick up
      runOnJS(playSound)('click');
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((event) => {
      if (isHidden) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (isHidden) return;

      const currentCenterX = startX + BUBBLE_SIZE / 2 + event.translationX;
      const currentCenterY = startY + BUBBLE_SIZE / 2 + event.translationY;

      // Check proximity to each slot
      let dropped = false;
      for (let i = 0; i < 2; i++) {
        if (filledSlots[i] !== null) continue; // slot already filled

        const slotCenterX = SLOT_START_X + i * (SLOT_WIDTH + SLOT_GAP) + SLOT_WIDTH / 2;
        const slotCenterY = SLOT_Y_IN_GAME + SLOT_HEIGHT / 2;

        const dist = Math.sqrt(
          Math.pow(currentCenterX - slotCenterX, 2) +
            Math.pow(currentCenterY - slotCenterY, 2)
        );

        if (dist < 65) {
          // Check correctness directly in the worklet
          const expectedSyllable = slotsInfo[i];
          const isCorrect = syllable === expectedSyllable;

          // Notify JS thread of the drop
          runOnJS(onDrop)(syllable, i);

          // Always snap to slot center first
          translateX.value = withSpring(slotCenterX - startX - BUBBLE_SIZE / 2);
          translateY.value = withSpring(slotCenterY - startY - BUBBLE_SIZE / 2);

          // If wrong, bounce back after a delay
          if (!isCorrect) {
            translateX.value = withDelay(
              400,
              withSequence(
                withSpring(slotCenterX - startX - BUBBLE_SIZE / 2 + 30, { damping: 3 }),
                withSpring(0, { damping: 10 })
              )
            );
            translateY.value = withDelay(
              400,
              withSequence(
                withSpring(slotCenterY - startY - BUBBLE_SIZE / 2 - 40, { damping: 3 }),
                withSpring(0, { damping: 10 })
              )
            );
            scale.value = withDelay(400, withSpring(1));
          } else {
            scale.value = withSpring(1);
          }

          dropped = true;
          break;
        }
      }

      if (!dropped) {
        // Bounce back to original position
        translateX.value = withSpring(0, { damping: 12 });
        translateY.value = withSpring(0, { damping: 12 });
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + bobOffset.value },
      { scale: scale.value },
    ] as any,
    opacity: isHidden ? 0 : 1,
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        pointerEvents={isHidden ? 'none' : 'auto'}
        style={[
          styles.bubble,
          animatedStyle,
          {
            left: startX,
            top: startY,
            backgroundColor: color,
            borderColor: shadeColor(color, -20),
            shadowColor: color,
          },
        ]}
      >
        <Text style={styles.bubbleText}>{syllable}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f0' },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  resetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  resetBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 15,
    gap: 15,
  },
  progressBarBg: {
    flex: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },

  // ─── Word Image ─────────────────────────────────────────────────────────
  wordImageArea: {
    alignItems: 'center',
    marginTop: 15,
  },
  emojiContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#a7f3d0',
  },
  emojiText: {
    fontSize: 56,
  },
  hintLabel: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },

  // ─── Slots ──────────────────────────────────────────────────────────────
  slotsRow: {
    flexDirection: 'row',
    gap: SLOT_GAP,
    position: 'absolute',
    left: SLOT_START_X,
    top: SLOT_Y_IN_GAME,
    zIndex: 5,
  },
  slotOuter: {
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
  },
  slotEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#94a3b8',
    borderStyle: 'dashed',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmptyText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  slotFilled: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  slotFilledText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065f46',
  },
  slotGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 14,
  },

  // ─── Word Complete ──────────────────────────────────────────────────────
  wordCompleteBanner: {
    position: 'absolute',
    top: SLOT_Y_IN_GAME + SLOT_HEIGHT + 15,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#a7f3d0',
    zIndex: 20,
  },
  wordCompleteText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065f46',
    textAlign: 'center',
  },

  // ─── Mascot ─────────────────────────────────────────────────────────────
  mascotArea: {
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    top: SLOT_Y_IN_GAME + SLOT_HEIGHT + 70,
    zIndex: 1,
  },
  mascotBalloon: {
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2.5,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  mascotText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
  },

  // ─── Bubbles ────────────────────────────────────────────────────────────
  bubblesArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderBottomWidth: 6,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10,
  },
  bubbleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  // ─── Finished ───────────────────────────────────────────────────────────
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  finishedMascot: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  finishedTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10b981',
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 26,
  },
  starsSummaryContainer: {
    marginTop: 25,
    alignItems: 'center',
    gap: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  starsRewardBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  starsRewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97706',
  },
  backButtonLarge: {
    marginTop: 30,
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
