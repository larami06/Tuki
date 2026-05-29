import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, Easing, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FallingWord {
  id: string;
  word: string;
  isReal: boolean;
  x: number;
}

const REAL_WORDS = ["GATO", "BOLA", "CASA", "SOL", "LUA", "VIDA", "AMOR", "FLOR", "BOLO", "DOCE"];
const FAKE_WORDS = ["GOTA" /* Real actually, but less common */, "XIRU", "PLOB", "ZUXO", "KAZA", "VULA", "TRIM", "BLOP", "FRIX"];

const TOTAL_ITEMS = 15;
const FALL_DURATION = 8000;
const SPAWN_INTERVAL = 1200;

export default function DesafioFinalAlfabetizacaoScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(7);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [spawnedItems, setSpawnedItems] = useState<FallingWord[]>([]);
  const [tappedIds, setTappedIds] = useState<Set<string>>(new Set());
  const [showClimax, setShowClimax] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const spawnIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Back Handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (isFinished || showClimax) return;

    timerRef.current = setInterval(() => {
      const idx = spawnIndexRef.current;
      if (idx >= TOTAL_ITEMS) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // End of game check after a few seconds to let last items fall
        setTimeout(() => {
          setShowClimax(true);
          playSound('victory');
        }, FALL_DURATION);
        
        return;
      }

      // 60% chance of being a real word
      const isReal = Math.random() > 0.4;
      const wordList = isReal ? REAL_WORDS : FAKE_WORDS;
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const x = 20 + Math.random() * (SCREEN_WIDTH - 120); // 100 is approx word width

      const newItem: FallingWord = {
        id: `word-${idx}`,
        word,
        isReal,
        x,
      };

      setSpawnedItems((prev) => [...prev, newItem]);
      spawnIndexRef.current += 1;
    }, SPAWN_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, showClimax]);

  useEffect(() => {
    if (isFinished) {
      completeGame(score, score);
    }
  }, [isFinished]);

  const handleTapItem = useCallback((id: string, isReal: boolean) => {
    if (tappedIds.has(id) || showClimax) return;
    setTappedIds((prev) => new Set(prev).add(id));

    if (isReal) {
      playSound('correct');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScore((s) => s + 1);
    } else {
      playSound('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [tappedIds, showClimax]);

  if (showClimax && !isFinished) {
    return (
      <SafeAreaView style={styles.climaxSafeArea}>
        <ConfettiEffect />
        <View style={styles.climaxContainer}>
          <Text style={styles.climaxTitle}>O Baile das Palavras!</Text>
          <Image
            source={require('../../assets/images/happy-tuki.png')}
            style={styles.climaxMascot}
            resizeMode="contain"
          />
          <Animated.View entering={BounceIn.delay(500)} style={styles.secretPhraseBox}>
            <Text style={styles.secretPhrase}>VOCÊ É INCRÍVEL LENDO!</Text>
          </Animated.View>
          
          <TouchableOpacity
            style={[styles.backButtonLarge, { marginTop: 40 }]}
            onPress={() => {
              playSound('click');
              setIsFinished(true); // Triggers save and shows standard finish screen or just exits
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>Encerrar Trilha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playSound('click'); setShowExitModal(true); }} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>O Baile das Palavras</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>Toque apenas nas palavras REAIS!</Text>
      </View>

      <View style={styles.gameArea}>
        {spawnedItems.map((item) => {
          const isTapped = tappedIds.has(item.id);
          return (
            <FallingWordBubble
              key={item.id}
              item={item}
              isTapped={isTapped}
              onTap={handleTapItem}
            />
          );
        })}
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

function FallingWordBubble({ item, isTapped, onTap }: any) {
  const translateY = useSharedValue(-100);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(SCREEN_HEIGHT * 0.8, {
      duration: FALL_DURATION,
      easing: Easing.linear,
    });
  }, []);

  useEffect(() => {
    if (isTapped) {
      if (item.isReal) {
        scale.value = withSequence(withSpring(1.5), withTiming(0, { duration: 300 }));
        opacity.value = withTiming(0, { duration: 400 });
      } else {
        scale.value = withSequence(withTiming(0.8, { duration: 100 }), withSpring(1));
        opacity.value = withSequence(withTiming(0.3, { duration: 100 }), withTiming(0.7, { duration: 200 }));
      }
    }
  }, [isTapped]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={isTapped && item.isReal}
      onPress={() => onTap(item.id, item.isReal)}
      style={{ position: 'absolute', left: item.x, top: 0, zIndex: 10 }}
    >
      <Animated.View style={[styles.bubble, isTapped && item.isReal && styles.bubbleCorrect, isTapped && !item.isReal && styles.bubbleWrong, animStyle]}>
        <Text style={styles.bubbleText}>{item.word}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#334155', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, elevation: 6
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  scoreBadge: { backgroundColor: '#475569', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 16 },

  instructionBanner: { backgroundColor: '#1e293b', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#3b82f6' },
  instructionText: { color: '#60a5fa', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

  gameArea: { flex: 1, overflow: 'hidden' },

  bubble: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 2, borderColor: '#3b82f6',
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30, elevation: 4,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
  },
  bubbleCorrect: { backgroundColor: '#065f46', borderColor: '#10b981' },
  bubbleWrong: { backgroundColor: '#7f1d1d', borderColor: '#ef4444' },
  bubbleText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },

  climaxSafeArea: { flex: 1, backgroundColor: '#0f172a' },
  climaxContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  climaxTitle: { fontSize: 36, fontWeight: '900', color: '#60a5fa', marginBottom: 30, textAlign: 'center' },
  climaxMascot: { width: '80%', height: Dimensions.get('window').height * 0.35, marginBottom: 40 },
  secretPhraseBox: { backgroundColor: '#3b82f6', padding: 20, borderRadius: 20, borderWidth: 4, borderColor: '#bfdbfe', elevation: 10 },
  secretPhrase: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 1 },
  
  backButtonLarge: { backgroundColor: '#10b981', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4 },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
