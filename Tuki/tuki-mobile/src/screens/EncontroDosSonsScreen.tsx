import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, withSequence, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width } = Dimensions.get('window');

const CHALLENGES = [
  { id: 1, fixedLetter: 'O', draggableLetter: 'I', result: 'OI!', emoji: '👋', context: 'O menino acenando diz:' },
  { id: 2, fixedLetter: 'A', draggableLetter: 'I', result: 'AI!', emoji: '🩹', context: 'Quem machucou o joelho diz:' },
  { id: 3, fixedLetter: 'A', draggableLetter: 'U', result: 'AU!', emoji: '🐶', context: 'O cachorrinho latindo faz:' },
];

export default function EncontroDosSonsScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFusion, setShowFusion] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentChallenge = CHALLENGES[currentIndex] || { fixedLetter: '', draggableLetter: '', result: '', emoji: '', context: '' };
  const isFinished = currentIndex >= CHALLENGES.length;

  useEffect(() => {
    if (isFinished) {
      completeGame(CHALLENGES.length, CHALLENGES.length);
    }
  }, [isFinished]);

  // ─── Back Handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const fixedScale = useSharedValue(1);

  const triggerMagicFusion = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound('correct');
    setShowFusion(true);

    fixedScale.value = withSequence(withSpring(1.2), withSpring(1));

    setTimeout(() => {
      if (currentIndex < CHALLENGES.length - 1) {
        setShowFusion(false);
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 2500);
  };

  const checkFusion = (x: number, y: number) => {
    // Se a letra for arrastada para a esquerda (x negativo) em pelo menos 120 pixels 
    // e estiver na mesma linha (y próximo de 0)
    if (x < -100 && Math.abs(y) < 100) {
      // Efeito Imã: gruda na outra letra
      translateX.value = withSpring(-140);
      translateY.value = withSpring(0);
      runOnJS(triggerMagicFusion)();
    } else {
      // Voltar quicando
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      // Não permite arrastar pra tela fundir se já tiver fundido
      if (!showFusion) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (!showFusion) {
        checkFusion(translateX.value, translateY.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    zIndex: 10,
  }));

  const fixedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fixedScale.value }
    ]
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { playSound('click'); setShowExitModal(true); }} style={styles.backButton}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ímã dos Sons</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          <Text style={styles.emoji}>{currentChallenge.emoji}</Text>
          <Text style={styles.instruction}>{currentChallenge.context}</Text>

          <View style={styles.arenaContainer}>
            {!showFusion ? (
              <View style={styles.arena}>
                <Animated.View style={[styles.letterCard, styles.fixedLetter, fixedStyle]}>
                  <Text style={styles.letterText}>{currentChallenge.fixedLetter}</Text>
                </Animated.View>

                {/* Ícone ou dica visual no meio, opcional */}
                <View style={styles.magnetHint}>
                  <Text style={{ fontSize: 24, opacity: 0.3 }}>🧲</Text>
                </View>

                <GestureDetector gesture={dragGesture}>
                  <Animated.View style={[styles.letterCard, styles.draggableLetter, animatedStyle]}>
                    <Text style={styles.letterText}>{currentChallenge.draggableLetter}</Text>
                  </Animated.View>
                </GestureDetector>
              </View>
            ) : (
              <Animated.View entering={FadeIn} style={styles.fusionResult}>
                <Text style={styles.fusionText}>{currentChallenge.result}</Text>
                <Text style={styles.fusionSubtext}>Fusão Mágica! +3 ⭐</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.mascotArea}>
            <View style={styles.mascotBalloon}>
              <Text style={styles.mascotText}>
                {showFusion ? '👏 Tuki adorou! Que fusão legal!' : '👀 Arraste a letra azul até a amarela!'}
              </Text>
            </View>
          </View>
        </View>
      {completionState && (
        <GameCompletionModal state={completionState} onContinue={() => router.back()} />
      )}
      
      <ExitConfirmModal 
        visible={showExitModal} 
        onCancel={() => setShowExitModal(false)} 
        onConfirm={() => { setShowExitModal(false); router.back(); }} 
      />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    backgroundColor: '#4ecdc4',
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
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 60,
    textAlign: 'center',
  },
  arenaContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  arena: {
    flexDirection: 'row',
    width: 250,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  magnetHint: {
    position: 'absolute',
    left: '50%',
    marginLeft: -15, // center it roughly
  },
  letterCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderBottomWidth: 6,
  },
  fixedLetter: {
    backgroundColor: '#FFC107',
    borderColor: '#D39E00',
    zIndex: 1,
  },
  draggableLetter: {
    backgroundColor: '#1CB0F6',
    borderColor: '#1899D6',
    zIndex: 10, // Must be higher so it goes over the other if needed
  },
  letterText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
  },
  fusionResult: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fusionText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#4ecdc4',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  fusionSubtext: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 10,
  },
  mascotArea: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  mascotBalloon: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  mascotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
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
    color: '#4ecdc4',
    marginBottom: 10,
  },
  finishedSubtitle: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 28,
  },
  backButtonLarge: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
