import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, Easing, FadeIn, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHALLENGES = [
  {
    id: 1,
    phraseParts: ['O', 'cachorro', 'gosta', 'de', '___'],
    options: [
      { word: 'osso', emoji: '🦴', isCorrect: true },
      { word: 'pedra', emoji: '🪨', isCorrect: false },
      { word: 'nuvem', emoji: '☁️', isCorrect: false }
    ],
    mascotEmoji: '🐶',
    correctFeedback: 'O cachorro pegou o osso! 🐶🦴'
  },
  {
    id: 2,
    phraseParts: ['O', 'gato', 'dorme', 'no', '___'],
    options: [
      { word: 'sofá', emoji: '🛋️', isCorrect: true },
      { word: 'fogo', emoji: '🔥', isCorrect: false },
      { word: 'lago', emoji: '🌊', isCorrect: false }
    ],
    mascotEmoji: '🐱',
    correctFeedback: 'O gato está roncando no sofá! 🐱💤🛋️'
  },
  {
    id: 3,
    phraseParts: ['O', 'macaco', 'come', '___'],
    options: [
      { word: 'banana', emoji: '🍌', isCorrect: true },
      { word: 'sapato', emoji: '👞', isCorrect: false },
      { word: 'carro', emoji: '🚗', isCorrect: false }
    ],
    mascotEmoji: '🐒',
    correctFeedback: 'O macaco devorou a banana! 🐒🍌'
  }
];

export default function FrasesDivertidasScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const challenge = CHALLENGES[currentIndex];
  
  const mascotAnim = useSharedValue(0);

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

  const handleSelect = (option: any) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedWord(option.word);

    if (option.isCorrect) {
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowFeedback('correct');
      
      // Mascot animation
      mascotAnim.value = withSequence(
        withTiming(-20, { duration: 150 }),
        withTiming(20, { duration: 150 }),
        withTiming(-20, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );

      setTimeout(() => {
        setShowFeedback(null);
        setSelectedWord(null);
        if (currentIndex < CHALLENGES.length - 1) {
          setCurrentIndex((i) => i + 1);
          setDisabled(false);
        } else {
          setIsFinished(true);
        }
      }, 2500);
    } else {
      playSound('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowFeedback('wrong');
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedWord(null);
        setDisabled(false);
      }, 1200);
    }
  };

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mascotAnim.value }]
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playSound('click'); setShowExitModal(true); }} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frases Divertidas</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{CHALLENGES.length}
          </Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {/* Mascot & Balloon */}
        <View style={styles.mascotArea}>
          <Animated.Text style={[styles.mascotEmoji, mascotStyle]}>
            {challenge.mascotEmoji}
          </Animated.Text>
          
          <Animated.View entering={ZoomIn} key={`phrase-${currentIndex}`} style={styles.balloon}>
            <View style={styles.phraseContainer}>
              {challenge.phraseParts.map((part, idx) => (
                <Text key={idx} style={[styles.phraseWord, part === '___' && styles.phraseBlank]}>
                  {part === '___' && showFeedback === 'correct' ? selectedWord : part}
                </Text>
              ))}
            </View>
            <View style={styles.balloonTail} />
          </Animated.View>
        </View>

        {/* Feedback area */}
        <View style={styles.feedbackArea}>
          {showFeedback === 'correct' && (
            <Animated.Text entering={BounceIn} style={styles.feedbackCorrectText}>
              {challenge.correctFeedback}
            </Animated.Text>
          )}
          {showFeedback === 'wrong' && (
            <Animated.Text entering={BounceIn} style={styles.feedbackWrongText}>
              Ops! Essa palavra não faz sentido...
            </Animated.Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {challenge.options.map((option, idx) => {
            const isSelected = selectedWord === option.word;
            const isWrongChoice = isSelected && showFeedback === 'wrong';
            
            return (
              <OptionButton
                key={`${currentIndex}-${idx}`}
                option={option}
                onSelect={() => handleSelect(option)}
                isWrong={isWrongChoice}
                disabled={disabled}
              />
            );
          })}
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
  );
}

function OptionButton({ option, onSelect, isWrong, disabled }: any) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (isWrong) {
      shake.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-10, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [isWrong]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => {
        scale.value = withSequence(withSpring(0.9), withSpring(1));
        onSelect();
      }}
    >
      <Animated.View style={[styles.optionButton, isWrong && styles.optionButtonWrong, animStyle]}>
        <Text style={styles.optionEmoji}>{option.emoji}</Text>
        <Text style={styles.optionText}>{option.word}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf4ff' },
  header: {
    padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#d946ef', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  progressContainer: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  progressText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  gameArea: { flex: 1, padding: 20, justifyContent: 'space-between' },
  
  mascotArea: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  mascotEmoji: { fontSize: 80, marginBottom: 20 },
  balloon: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 3, borderColor: '#d946ef',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    minWidth: SCREEN_WIDTH * 0.8, alignItems: 'center'
  },
  balloonTail: {
    position: 'absolute', top: -15, left: '50%', marginLeft: -10,
    width: 0, height: 0, borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 20,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#d946ef',
  },
  phraseContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  phraseWord: { fontSize: 26, fontWeight: 'bold', color: '#4a044e' },
  phraseBlank: { color: '#cbd5e1', textDecorationLine: 'underline' },

  feedbackArea: { height: 80, justifyContent: 'center', alignItems: 'center' },
  feedbackCorrectText: { fontSize: 22, fontWeight: 'bold', color: '#16a34a', textAlign: 'center' },
  feedbackWrongText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', textAlign: 'center' },

  optionsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40 },
  optionButton: {
    backgroundColor: '#fff', borderRadius: 20, padding: 15, alignItems: 'center', width: SCREEN_WIDTH * 0.28,
    borderWidth: 2, borderColor: '#f0abfc', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  optionButtonWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionEmoji: { fontSize: 40, marginBottom: 8 },
  optionText: { fontSize: 18, fontWeight: 'bold', color: '#4a044e', textTransform: 'uppercase' },

  finishedSafeArea: { flex: 1, backgroundColor: '#fdf4ff' },
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
  finishedTitle: { fontSize: 38, fontWeight: '900', color: '#d946ef', marginBottom: 10, textAlign: 'center' },
  finishedSubtitle: { fontSize: 20, color: '#64748b', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
  backButtonLarge: { backgroundColor: '#d946ef', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4 },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
