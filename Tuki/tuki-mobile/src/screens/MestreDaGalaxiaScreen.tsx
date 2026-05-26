import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  ZoomIn,
  BounceIn,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Mission types ──────────────────────────────────────────────────────────
interface FallingItem {
  id: string;
  emoji: string;
  label: string;
  isCorrect: boolean;
  x: number;
  delay: number;
}

interface Mission {
  instruction: string;
  items: Omit<FallingItem, 'id' | 'x' | 'delay'>[];
  requiredCorrect: number;
}

const MISSIONS: Mission[] = [
  {
    instruction: 'Toque em todos os CÍRCULOS! ⭕',
    items: [
      { emoji: '⭕', label: 'círculo', isCorrect: true },
      { emoji: '⭕', label: 'círculo', isCorrect: true },
      { emoji: '⭕', label: 'círculo', isCorrect: true },
      { emoji: '🔺', label: 'triângulo', isCorrect: false },
      { emoji: '🟥', label: 'quadrado', isCorrect: false },
      { emoji: '🔺', label: 'triângulo', isCorrect: false },
      { emoji: '⭕', label: 'círculo', isCorrect: true },
      { emoji: '🟥', label: 'quadrado', isCorrect: false },
    ],
    requiredCorrect: 4,
  },
  {
    instruction: 'Toque nas somas que dão 5! 🌟',
    items: [
      { emoji: '2+3', label: 'soma5', isCorrect: true },
      { emoji: '1+4', label: 'soma5', isCorrect: true },
      { emoji: '3+3', label: 'soma6', isCorrect: false },
      { emoji: '4+1', label: 'soma5', isCorrect: true },
      { emoji: '2+2', label: 'soma4', isCorrect: false },
      { emoji: '1+1', label: 'soma2', isCorrect: false },
      { emoji: '3+2', label: 'soma5', isCorrect: true },
      { emoji: '5+1', label: 'soma6', isCorrect: false },
    ],
    requiredCorrect: 4,
  },
  {
    instruction: 'Toque em todos os TRIÂNGULOS! 🔺',
    items: [
      { emoji: '🔺', label: 'triângulo', isCorrect: true },
      { emoji: '⭕', label: 'círculo', isCorrect: false },
      { emoji: '🔺', label: 'triângulo', isCorrect: true },
      { emoji: '🟥', label: 'quadrado', isCorrect: false },
      { emoji: '🔺', label: 'triângulo', isCorrect: true },
      { emoji: '⭕', label: 'círculo', isCorrect: false },
      { emoji: '🟥', label: 'quadrado', isCorrect: false },
      { emoji: '🔺', label: 'triângulo', isCorrect: true },
    ],
    requiredCorrect: 4,
  },
  {
    instruction: 'Toque nas somas que dão 3! ⭐',
    items: [
      { emoji: '1+2', label: 'soma3', isCorrect: true },
      { emoji: '2+2', label: 'soma4', isCorrect: false },
      { emoji: '0+3', label: 'soma3', isCorrect: true },
      { emoji: '3+1', label: 'soma4', isCorrect: false },
      { emoji: '2+1', label: 'soma3', isCorrect: true },
      { emoji: '1+1', label: 'soma2', isCorrect: false },
      { emoji: '3+0', label: 'soma3', isCorrect: true },
      { emoji: '4+1', label: 'soma5', isCorrect: false },
    ],
    requiredCorrect: 4,
  },
];

const ITEM_SIZE = 60;
const FALL_DURATION = 7000;
const SPAWN_INTERVAL = 900;

export default function MestreDaGalaxiaScreen() {
  const router = useRouter();
  const [missionIndex, setMissionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [spawnedItems, setSpawnedItems] = useState<FallingItem[]>([]);
  const [tappedIds, setTappedIds] = useState<Set<string>>(new Set());
  const [cometProgress, setCometProgress] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const spawnIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cometTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mission = MISSIONS[missionIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cometTimerRef.current) clearInterval(cometTimerRef.current);
    };
  }, []);

  // Spawn items for current mission
  useEffect(() => {
    if (isFinished || missionComplete) return;

    // Reset for new mission
    spawnIndexRef.current = 0;
    setSpawnedItems([]);
    setTappedIds(new Set());
    setCorrectHits(0);
    setCometProgress(0);

    // Spawn items one by one
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const idx = spawnIndexRef.current;
      if (idx >= mission.items.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const item = mission.items[idx];
      const x = 20 + Math.random() * (SCREEN_WIDTH - ITEM_SIZE - 40);
      const newItem: FallingItem = {
        ...item,
        id: `${missionIndex}-${idx}`,
        x,
        delay: 0,
      };
      setSpawnedItems((prev) => [...prev, newItem]);
      spawnIndexRef.current += 1;
    }, SPAWN_INTERVAL);

    // Comet progress timer
    if (cometTimerRef.current) clearInterval(cometTimerRef.current);
    cometTimerRef.current = setInterval(() => {
      setCometProgress((prev) => {
        if (prev >= 100) {
          if (cometTimerRef.current) clearInterval(cometTimerRef.current);
          return 100;
        }
        return prev + 1.5;
      });
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cometTimerRef.current) clearInterval(cometTimerRef.current);
    };
  }, [missionIndex, isFinished]);

  // Check mission completion
  useEffect(() => {
    if (correctHits >= mission.requiredCorrect && !missionComplete && !isFinished) {
      setMissionComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (cometTimerRef.current) clearInterval(cometTimerRef.current);
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        setMissionComplete(false);
        if (missionIndex < MISSIONS.length - 1) {
          setMissionIndex((i) => i + 1);
          setScore((s) => s + 1);
        } else {
          setScore((s) => s + 1);
          setIsFinished(true);
        }
      }, 1800);
    }
  }, [correctHits]);

  // Save on finish
  useEffect(() => {
    if (isFinished) {
      playSound('victory');
      const salvar = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            await registrarProgresso({
              idUsuario: perfil.id,
              idLicao: 36,
              pontuacao: score,
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

  const handleTapItem = useCallback(
    (id: string, isCorrect: boolean) => {
      if (tappedIds.has(id)) return;
      setTappedIds((prev) => new Set(prev).add(id));

      if (isCorrect) {
        playSound('correct');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCorrectHits((c) => c + 1);
      } else {
        playSound('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [tappedIds]
  );

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
          <Text style={styles.finishedTitle}>Mestre da Galáxia!</Text>
          <Text style={styles.finishedSubtitle}>
            Você salvou a base espacial do cometa! 🚀☄️
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
        <Text style={styles.headerTitle}>Mestre da Galáxia</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {missionIndex + 1}/{MISSIONS.length}
          </Text>
        </View>
      </View>

      {/* Mission instruction */}
      <Animated.View
        entering={ZoomIn}
        key={`mission-${missionIndex}`}
        style={styles.missionBanner}
      >
        <Text style={styles.missionText}>{mission.instruction}</Text>
        <Text style={styles.hitCounter}>
          ✅ {correctHits}/{mission.requiredCorrect}
        </Text>
      </Animated.View>

      {/* Comet progress bar */}
      <View style={styles.cometBarContainer}>
        <Text style={styles.cometLabel}>☄️ Cometa</Text>
        <View style={styles.cometBarBg}>
          <View
            style={[
              styles.cometBarFill,
              {
                width: `${Math.min(cometProgress, 100)}%`,
                backgroundColor:
                  cometProgress > 75
                    ? '#ef4444'
                    : cometProgress > 50
                    ? '#f59e0b'
                    : '#22c55e',
              },
            ]}
          />
        </View>
        <Text style={styles.cometLabel}>🛸 Base</Text>
      </View>

      {/* Game area */}
      <View style={styles.gameArea}>
        {missionComplete && (
          <Animated.View entering={BounceIn} style={styles.missionCompleteBanner}>
            <Text style={styles.missionCompleteText}>
              ✨ Missão Cumprida! ✨
            </Text>
          </Animated.View>
        )}

        {spawnedItems.map((item) => {
          const isTapped = tappedIds.has(item.id);
          return (
            <FallingItemComponent
              key={item.id}
              item={item}
              isTapped={isTapped}
              onTap={handleTapItem}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ─── Falling Item Component ─────────────────────────────────────────────────
function FallingItemComponent({
  item,
  isTapped,
  onTap,
}: {
  item: FallingItem;
  isTapped: boolean;
  onTap: (id: string, isCorrect: boolean) => void;
}) {
  const translateY = useSharedValue(-ITEM_SIZE);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const tapScale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(SCREEN_HEIGHT * 0.65, {
      duration: FALL_DURATION,
      easing: Easing.linear,
    });
  }, []);

  useEffect(() => {
    if (isTapped) {
      if (item.isCorrect) {
        tapScale.value = withSequence(withSpring(1.5), withTiming(0, { duration: 300 }));
        opacity.value = withTiming(0, { duration: 400 });
      } else {
        tapScale.value = withSequence(
          withTiming(0.7, { duration: 100 }),
          withSpring(1)
        );
        opacity.value = withSequence(
          withTiming(0.3, { duration: 100 }),
          withTiming(0.6, { duration: 200 })
        );
      }
    }
  }, [isTapped]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value * tapScale.value },
    ],
    opacity: opacity.value,
  }));

  const isEmoji = !item.emoji.includes('+');

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={isTapped && item.isCorrect}
      onPress={() => onTap(item.id, item.isCorrect)}
      style={{ position: 'absolute', left: item.x, top: 0, zIndex: 10 }}
    >
      <Animated.View
        style={[
          styles.fallingItem,
          isTapped && item.isCorrect && styles.fallingItemCorrect,
          isTapped && !item.isCorrect && styles.fallingItemWrong,
          animStyle,
        ]}
      >
        {isEmoji ? (
          <Text style={styles.fallingEmoji}>{item.emoji}</Text>
        ) : (
          <Text style={styles.fallingMath}>{item.emoji}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0520' },

  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a0a3e',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#ef4444',
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
  progressText: { color: '#f87171', fontWeight: 'bold', fontSize: 16 },

  // Mission banner
  missionBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#1e1145',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#4f46e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionText: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  hitCounter: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },

  // Comet bar
  cometBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    gap: 8,
  },
  cometLabel: {
    fontSize: 16,
    color: '#fff',
  },
  cometBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#1e1145',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e2560',
  },
  cometBarFill: {
    height: '100%',
    borderRadius: 5,
  },

  // Game area
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 8,
  },

  // Mission complete
  missionCompleteBanner: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: '#052e16',
    borderColor: '#22c55e',
    borderWidth: 3,
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    elevation: 20,
  },
  missionCompleteText: {
    color: '#22c55e',
    fontSize: 28,
    fontWeight: '900',
  },

  // Falling items
  fallingItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    backgroundColor: '#1e1b4b',
    borderWidth: 2.5,
    borderColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  fallingItemCorrect: {
    backgroundColor: '#052e16',
    borderColor: '#22c55e',
  },
  fallingItemWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  fallingEmoji: {
    fontSize: 28,
  },
  fallingMath: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fbbf24',
  },

  // Finished
  finishedSafeArea: { flex: 1, backgroundColor: '#0a0520' },
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
    color: '#f87171',
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
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
  },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
