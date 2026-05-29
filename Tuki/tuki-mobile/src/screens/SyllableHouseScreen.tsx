import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, HelpCircle, Star, Sparkles } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
  BounceIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vowels definitions
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Vowel starting colors
const VOWEL_COLORS: Record<string, string> = {
  A: '#ff6b6b',
  E: '#4ecdc4',
  I: '#ffd166',
  O: '#f72585',
  U: '#7209b7',
};

// Residents/Visual representation of completed syllables
const SYLLABLE_DATA: Record<string, { resident: string; word: string; icon: string }> = {
  // Family of B
  BA: { resident: '🐝', word: 'Abelha', icon: '🐝' },
  BE: { resident: '👶', word: 'Bebê', icon: '👶' },
  BI: { resident: '🚲', word: 'Bicicleta', icon: '🚲' },
  BO: { resident: '⚽', word: 'Bola', icon: '⚽' },
  BU: { resident: '☕', word: 'Bule', icon: '☕' },
  // Family of C
  CA: { resident: '🏠', word: 'Casa', icon: '🏠' },
  CE: { resident: '🧅', word: 'Cebola', icon: '🧅' },
  CI: { resident: '🎪', word: 'Circo', icon: '🎪' },
  CO: { resident: '🐰', word: 'Coelho', icon: '🐰' },
  CU: { resident: '🎲', word: 'Cubo', icon: '🎲' },
};

// Target center calculations (House window position)
const HOUSE_WIDTH = 200;
const HOUSE_HEIGHT = 220;
const HOUSE_X = (SCREEN_WIDTH - HOUSE_WIDTH) / 2;
const HOUSE_Y = SCREEN_HEIGHT * 0.16;

const WINDOW_SIZE = 85;
const WINDOW_X = HOUSE_X + (HOUSE_WIDTH - WINDOW_SIZE) / 2;
const WINDOW_Y = HOUSE_Y + 65 + (155 - WINDOW_SIZE) / 2;

const TARGET_CENTER_X = WINDOW_X + WINDOW_SIZE / 2;
const TARGET_CENTER_Y = WINDOW_Y + WINDOW_SIZE / 2;

export default function SyllableHouseScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(3);

  // Round State ('B' or 'C')
  const [currentLetter, setCurrentLetter] = useState<'B' | 'C'>('B');
  const [completedVowels, setCompletedVowels] = useState<string[]>([]);
  const [activeVowel, setActiveVowel] = useState<string | null>(null);

  // Success Celebration & Feedback
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastSyllable, setLastSyllable] = useState<string | null>(null);
  const [isCWarningActive, setIsCWarningActive] = useState(false);
  const [score, setScore] = useState(0);

  // Level completion
  const [isFinished, setIsFinished] = useState(false);

  // Shared values for house animation
  const houseShakeX = useSharedValue(0);
  const houseScale = useSharedValue(1);
  const windowColorProgress = useSharedValue(0);
  const progressPercent = useSharedValue(0);

  // Update animated progress bar
  const totalCompleted = (currentLetter === 'C' ? 5 : 0) + completedVowels.length;
  const progressRatio = totalCompleted / 10;

  useEffect(() => {
    progressPercent.value = withSpring(progressRatio, { damping: 15 });
  }, [totalCompleted]);

  // Handle final victory and progress saving
  useEffect(() => {
    if (isFinished) {
      completeGame(score, 10);
    }
  }, [isFinished]);

  // House Animated Style
  const houseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: houseShakeX.value }, { scale: houseScale.value }] as any,
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressPercent.value * 100}%`,
    };
  });

  // Action: Trigger house shake on C warning
  const triggerHouseShake = () => {
    houseShakeX.value = withSequence(
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  // Action: Success bounce
  const triggerHouseBounce = () => {
    houseScale.value = withSequence(withSpring(1.15), withSpring(1));
  };

  // Drag and Drop Success Logic
  const handleDropSuccess = (vowel: string) => {
    const syllable = currentLetter + vowel;
    setLastSyllable(syllable);
    setActiveVowel(vowel);
    setScore((prev) => prev + 1);

    const isSoftC = currentLetter === 'C' && (vowel === 'E' || vowel === 'I');

    if (isSoftC) {
      // Special logic for soft C (CE, CI)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Play high-pitch/click sequence as a "pegadinha" warning effect since we have click sound
      playSound('click');
      setTimeout(() => playSound('click'), 150);
      triggerHouseShake();
      setIsCWarningActive(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('correct');
      triggerHouseBounce();
    }

    setShowCelebration(true);

    // Lock in vowel and schedule next step
    setTimeout(() => {
      setCompletedVowels((prev) => [...prev, vowel]);
      setShowCelebration(false);
      setIsCWarningActive(false);
      setActiveVowel(null);
      setLastSyllable(null);

      // Check round transition
      if (completedVowels.length === 4) {
        // Wait 1 second before transitioning
        setTimeout(() => {
          if (currentLetter === 'B') {
            playSound('correct');
            setCurrentLetter('C');
            setCompletedVowels([]);
          } else {
            setIsFinished(true);
          }
        }, 600);
      }
    }, isSoftC ? 4500 : 2500); // give more time for soft C pedagogical tip
  };

  // Get current mascot feedback message
  const getMascotMessage = () => {
    if (showCelebration && lastSyllable) {
      const data = SYLLABLE_DATA[lastSyllable];
      if (currentLetter === 'C' && (lastSyllable === 'CE' || lastSyllable === 'CI')) {
        return `⚠️ O C mudou de som! ${currentLetter} + ${lastSyllable.slice(1)} faz ${lastSyllable} com som de /s/! Que nem na palavra ${data.word}! ${data.resident}`;
      }
      return `🎉 Excelente! ${currentLetter} + ${lastSyllable.slice(1)} faz ${lastSyllable}! De ${data.word}! ${data.resident}`;
    }

    if (currentLetter === 'B') {
      return `Olá amiguinho! Sou o Tuki! 🌳 Arraste as vogais coloridas para a janela da casa e vamos conhecer a Família do B! 🐝`;
    } else {
      return `Muito bem! Agora vamos para a casinha do C! 🏠 Arraste as vogais e preste atenção, pois algumas mudam de som! 😮`;
    }
  };

  // Restart/Skip for development or manual resets
  const handleReset = () => {
    playSound('click');
    setCurrentLetter('B');
    setCompletedVowels([]);
    setScore(0);
    setIsFinished(false);
    setShowCelebration(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Background confetes on success */}
        {showCelebration && !isCWarningActive && <ConfettiEffect />}

        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentLetter === 'B' ? '#45b7d1' : '#a855f7' }]}>
          <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Casa das Sílabas</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBadge}>
            <Sparkles size={16} color="#fff" />
            <Text style={styles.resetBadgeText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Responsive Progress Bar */}
        <View style={styles.progressArea}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progressAnimatedStyle, { backgroundColor: currentLetter === 'B' ? '#45b7d1' : '#a855f7' }]} />
          </View>
          <Text style={styles.progressText}>{totalCompleted}/10</Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {/* Visual House */}
          <Animated.View style={[styles.houseContainer, houseAnimatedStyle]}>
            {/* House Roof */}
            <View style={[styles.houseRoof, { borderBottomColor: currentLetter === 'B' ? '#3399b3' : '#8b2fc9' }]} />
            <View style={styles.houseRoofCenter}>
              <Text style={styles.houseRoofText}>{currentLetter}</Text>
            </View>

            {/* House Body */}
            <View style={[styles.houseBody, { borderColor: currentLetter === 'B' ? '#3399b3' : '#8b2fc9' }]}>
              {/* Window (Drop Area) */}
              <View
                style={[
                  styles.houseWindow,
                  showCelebration
                    ? isCWarningActive
                      ? styles.houseWindowWarning
                      : styles.houseWindowSuccess
                    : styles.houseWindowDefault,
                ]}
              >
                {showCelebration && lastSyllable ? (
                  <Animated.View entering={BounceIn} style={styles.residentContainer}>
                    <Text style={styles.residentEmoji}>{SYLLABLE_DATA[lastSyllable].resident}</Text>
                    <Text style={styles.residentSyllable}>{lastSyllable}</Text>
                  </Animated.View>
                ) : (
                  <View style={styles.windowHintContainer}>
                    <Text style={styles.windowHintEmoji}>❔</Text>
                    <Text style={styles.windowHintText}>Arraste</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Syllables Built So Far Log */}
          <View style={styles.syllableLogContainer}>
            <Text style={styles.syllableLogTitle}>Família do {currentLetter}:</Text>
            <View style={styles.syllableLogList}>
              {VOWELS.map((v) => {
                const combined = completedVowels.includes(v);
                return (
                  <View
                    key={v}
                    style={[
                      styles.syllableLogItem,
                      combined
                        ? { backgroundColor: currentLetter === 'B' ? '#e0f2fe' : '#f3e8ff', borderColor: currentLetter === 'B' ? '#45b7d1' : '#a855f7' }
                        : styles.syllableLogItemEmpty,
                    ]}
                  >
                    <Text
                      style={[
                        styles.syllableLogItemText,
                        combined
                          ? { color: currentLetter === 'B' ? '#0369a1' : '#6b21a8' }
                          : styles.syllableLogItemTextEmpty,
                      ]}
                    >
                      {combined ? currentLetter + v : '_'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Mascot Balloon Area */}
          <View style={styles.mascotArea}>
            <View style={styles.mascotBalloon}>
              <Text style={styles.mascotText}>{getMascotMessage()}</Text>
            </View>
          </View>

          {/* Vowels Floating Area */}
          <View style={styles.vowelsArea} pointerEvents="box-none">
            {VOWELS.map((vowel, index) => {
              const isCompleted = completedVowels.includes(vowel);
              const isActive = activeVowel === vowel;

              return (
                <VowelBubble
                  key={currentLetter + '-' + vowel}
                  vowel={vowel}
                  index={index}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  onDropSuccess={handleDropSuccess}
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

// DRAGGABLE VOWEL BUBBLE COMPONENT
interface VowelBubbleProps {
  vowel: string;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  onDropSuccess: (vowel: string) => void;
}

function VowelBubble({ vowel, index, isCompleted, isActive, onDropSuccess }: VowelBubbleProps) {
  const color = VOWEL_COLORS[vowel];

  // Base physics starting positions
  const gap = (SCREEN_WIDTH - 5 * VOWEL_SIZE) / 6;
  const startX = gap + index * (VOWEL_SIZE + gap);
  const startY = SCREEN_HEIGHT * 0.72 - (index === 0 || index === 4 ? 0 : index === 1 || index === 3 ? 12 : 20);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Gentle float bobbing micro-animation
  const bobOffset = useSharedValue(0);

  useEffect(() => {
    if (!isCompleted && !isActive) {
      bobOffset.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 1500 + index * 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-8, { duration: 1500 + index * 200, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse
      );
    } else {
      bobOffset.value = 0;
    }
  }, [isCompleted, isActive]);

  // Reset position smoothly when completed so it doesn't superimpose in the center
  useEffect(() => {
    if (isCompleted) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    }
  }, [isCompleted]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      if (isCompleted || isActive) return;
      scale.value = withSpring(1.25);
      runOnJS(playSound)('click');
    })
    .onUpdate((event) => {
      if (isCompleted || isActive) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (isCompleted || isActive) return;

      // Absolute touch check
      const currentCenterX = startX + VOWEL_SIZE / 2 + event.translationX;
      const currentCenterY = startY + VOWEL_SIZE / 2 + event.translationY;

      // Distance to target
      const distance = Math.sqrt(
        Math.pow(currentCenterX - TARGET_CENTER_X, 2) + Math.pow(currentCenterY - TARGET_CENTER_Y, 2)
      );

      if (distance < 75) {
        // Snap directly into center of window!
        translateX.value = withSpring(TARGET_CENTER_X - startX - VOWEL_SIZE / 2);
        translateY.value = withSpring(TARGET_CENTER_Y - startY - VOWEL_SIZE / 2);
        scale.value = withSpring(1.0);
        runOnJS(onDropSuccess)(vowel);
      } else {
        // Bounce back to base position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + bobOffset.value },
        { scale: scale.value },
      ] as any,
      opacity: isCompleted ? 0.35 : 1,
    };
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        pointerEvents={isCompleted ? 'none' : 'auto'}
        style={[
          styles.vowelBubble,
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
        <Text style={styles.vowelText}>{vowel}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const VOWEL_SIZE = 60;

// Utility function to darken bubble border color slightly
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(((R * (100 + percent)) / 100).toString());
  G = parseInt(((G * (100 + percent)) / 100).toString());
  B = parseInt(((B * (100 + percent)) / 100).toString());

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  backButton: {
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
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  houseContainer: {
    width: HOUSE_WIDTH,
    height: HOUSE_HEIGHT,
    alignItems: 'center',
    position: 'absolute',
    left: HOUSE_X,
    top: HOUSE_Y,
    zIndex: 5,
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: HOUSE_WIDTH / 2 + 10,
    borderRightWidth: HOUSE_WIDTH / 2 + 10,
    borderBottomWidth: 75,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#45b7d1',
    zIndex: 2,
  },
  houseRoofCenter: {
    position: 'absolute',
    top: 30,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  houseRoofText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#d97706',
  },
  houseBody: {
    width: HOUSE_WIDTH,
    height: 160,
    backgroundColor: '#fffae5',
    borderWidth: 6,
    borderColor: '#45b7d1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
    marginTop: -5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseWindow: {
    width: WINDOW_SIZE,
    height: WINDOW_SIZE,
    borderRadius: 18,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  houseWindowDefault: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  houseWindowSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderStyle: 'solid',
  },
  houseWindowWarning: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderStyle: 'solid',
  },
  windowHintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowHintEmoji: {
    fontSize: 26,
    opacity: 0.45,
  },
  windowHintText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginTop: 4,
  },
  residentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  residentEmoji: {
    fontSize: 34,
  },
  residentSyllable: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 2,
  },
  vowelBubble: {
    width: VOWEL_SIZE,
    height: VOWEL_SIZE,
    borderRadius: VOWEL_SIZE / 2,
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
  vowelText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  vowelsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  mascotArea: {
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    top: HOUSE_Y + HOUSE_HEIGHT + 75,
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
  syllableLogContainer: {
    position: 'absolute',
    top: HOUSE_Y + HOUSE_HEIGHT + 15,
    width: '90%',
    alignItems: 'center',
    zIndex: 2,
  },
  syllableLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
  },
  syllableLogList: {
    flexDirection: 'row',
    gap: 8,
  },
  syllableLogItem: {
    width: 50,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  syllableLogItemEmpty: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  syllableLogItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  syllableLogItemTextEmpty: {
    color: '#94a3b8',
  },
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
    fontSize: 36,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 10,
  },
  finishedSubtitle: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 28,
  },
  starsSummaryContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
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
  backButtonLarge: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
