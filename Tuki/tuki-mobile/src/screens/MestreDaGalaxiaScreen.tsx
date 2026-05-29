import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Circle {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isCorrect: boolean;
  x: number;
  size: number;
}

interface Mission {
  title: string;
  subtitle: string;
  emoji: string;
  requiredCorrect: number;
  spawnInterval: number;  // ms entre novos círculos
  fallDuration: number;   // ms para cair da topo ao fundo
  cometDuration: number;  // ms até a barra cheia (tempo de "respiro")
  generateCircle: (idx: number) => Omit<Circle, 'id' | 'x' | 'size'>;
}

// ─── Cores ────────────────────────────────────────────────────────────────────
const C = {
  green:  { fg: '#4ade80', bg: '#052e16' },
  blue:   { fg: '#60a5fa', bg: '#0c1a3a' },
  red:    { fg: '#f87171', bg: '#2a0a0a' },
  yellow: { fg: '#fbbf24', bg: '#292000' },
  purple: { fg: '#c084fc', bg: '#1a0030' },
  pink:   { fg: '#f472b6', bg: '#2a0015' },
  teal:   { fg: '#2dd4bf', bg: '#002020' },
} as const;

type CK = keyof typeof C;

// ─── Missões ──────────────────────────────────────────────────────────────────
const MISSIONS: Mission[] = [
  {
    title: 'Toque nos círculos VERDES!',
    subtitle: 'Só os verdes salvam a base 🟢',
    emoji: '🟢',
    requiredCorrect: 4,
    spawnInterval: 2200,   // 1 círculo a cada 2.2s — tempo confortável
    fallDuration: 7000,    // 7s para cair — criança tem tempo de reagir
    cometDuration: 22000,  // cometa demora 22s — missão leva ~9s mínimo
    generateCircle: (idx) => {
      const pool: CK[] = ['green', 'red', 'blue', 'yellow', 'green', 'purple', 'green', 'red', 'green', 'blue'];
      const ck = pool[idx % pool.length];
      const emoji = ({ green: '🟢', red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣', pink: '🩷', teal: '🩵' } as any)[ck] ?? '⚪';
      return { label: emoji, color: C[ck].fg, bgColor: C[ck].bg, isCorrect: ck === 'green' };
    },
  },
  {
    title: 'Toque nos números ÍMPARES!',
    subtitle: '1, 3, 5, 7, 9 são seus aliados 🔢',
    emoji: '🔢',
    requiredCorrect: 4,
    spawnInterval: 2000,
    fallDuration: 6500,
    cometDuration: 20000,
    generateCircle: (idx) => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const n = nums[idx % nums.length];
      const ok = n % 2 !== 0;
      return { label: String(n), color: ok ? C.teal.fg : C.red.fg, bgColor: ok ? C.teal.bg : C.red.bg, isCorrect: ok };
    },
  },
  {
    title: 'Toque nas somas que dão 5!',
    subtitle: '2+3? 1+4? Toque rápido! ⭐',
    emoji: '⭐',
    requiredCorrect: 4,
    spawnInterval: 2000,
    fallDuration: 6000,
    cometDuration: 20000,
    generateCircle: (idx) => {
      const exprs = [
        { label: '2+3', ok: true }, { label: '3+3', ok: false },
        { label: '1+4', ok: true }, { label: '2+2', ok: false },
        { label: '4+1', ok: true }, { label: '5+1', ok: false },
        { label: '0+5', ok: true }, { label: '3+2', ok: true },
        { label: '1+1', ok: false }, { label: '4+2', ok: false },
      ];
      const e = exprs[idx % exprs.length];
      return { label: e.label, color: e.ok ? C.yellow.fg : C.pink.fg, bgColor: e.ok ? C.yellow.bg : C.pink.bg, isCorrect: e.ok };
    },
  },
  {
    title: 'Toque nos maiores que 5!',
    subtitle: '6, 7, 8, 9, 10 — vai lá! 🚀',
    emoji: '🚀',
    requiredCorrect: 4,
    spawnInterval: 1900,
    fallDuration: 5800,
    cometDuration: 19000,
    generateCircle: (idx) => {
      const nums = [2, 7, 4, 9, 3, 6, 1, 8, 5, 10];
      const n = nums[idx % nums.length];
      const ok = n > 5;
      return { label: String(n), color: ok ? C.purple.fg : C.blue.fg, bgColor: ok ? C.purple.bg : C.blue.bg, isCorrect: ok };
    },
  },
];

const CIRCLE_SIZES = [66, 72, 62, 70, 64];
const MAX_CIRCLES_ON_SCREEN = 6; // nunca mais que 6 ao mesmo tempo

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function MestreDaGalaxiaScreen() {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(36);
  const [missionIndex, setMissionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [tappedIds, setTappedIds] = useState<Set<string>>(new Set());
  const tappedIdsRef = useRef<Set<string>>(new Set());
  const [cometProgress, setCometProgress] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [baseHp, setBaseHp] = useState(3);
  const [cometHit, setCometHit] = useState(false); // animação de impacto
  const [showExitModal, setShowExitModal] = useState(false);

  const spawnRef = useRef(0);
  const circleCountRef = useRef(0); // rastreia quantos estão na tela
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cometTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missionIndexRef = useRef(missionIndex);
  const correctHitsRef = useRef(correctHits);
  missionIndexRef.current = missionIndex;
  correctHitsRef.current = correctHits;

  const mission = MISSIONS[missionIndex];

  const stopTimers = () => {
    if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
    if (cometTimerRef.current) { clearInterval(cometTimerRef.current); cometTimerRef.current = null; }
  };

  // Cleanup ao desmontar
  useEffect(() => () => stopTimers(), []);

  // ─── Back Handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // ─── Inicia missão ────────────────────────────────────────────────────────
  const startMission = useCallback((idx: number) => {
    stopTimers();
    spawnRef.current = 0;
    circleCountRef.current = 0;
    setCircles([]);
    setTappedIds(new Set());
    tappedIdsRef.current = new Set();
    setCorrectHits(0);
    setCometProgress(0);
    setCometHit(false);
    setMissionComplete(false);

    const m = MISSIONS[idx];

    // Spawn de círculos — controla quantidade na tela
    spawnTimerRef.current = setInterval(() => {
      if (circleCountRef.current >= MAX_CIRCLES_ON_SCREEN) return; // aguarda espaço
      const spawnIdx = spawnRef.current;
      const circleData = m.generateCircle(spawnIdx);
      const size = CIRCLE_SIZES[spawnIdx % CIRCLE_SIZES.length];
      const x = 16 + Math.random() * (SCREEN_WIDTH - size - 32);
      const id = `${idx}-${spawnIdx}`;

      setCircles((prev) => [...prev, { ...circleData, id, x, size }]);
      circleCountRef.current += 1;
      spawnRef.current += 1;

      // Remove da tela automaticamente após cair (cleanup de acúmulo)
      setTimeout(() => {
        if (!tappedIdsRef.current.has(id) && circleData.isCorrect) {
          // Perde vida se um círculo correto cair sem ser tocado
          setBaseHp((hp) => {
            const newHp = hp - 1;
            if (newHp <= 0) setTimeout(() => setGameOver(true), 300);
            return newHp;
          });
        }
        setCircles((prev) => prev.filter((c) => c.id !== id));
        circleCountRef.current = Math.max(0, circleCountRef.current - 1);
      }, m.fallDuration + 300);
    }, m.spawnInterval);

    // Barra do cometa
    const step = 100 / (m.cometDuration / 200); // % por tick de 200ms
    cometTimerRef.current = setInterval(() => {
      setCometProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          // Cometa chegou! Game Over imediato
          stopTimers();
          setCometHit(true);
          playSound('wrong');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          setTimeout(() => setGameOver(true), 800);
          return 100;
        }
        return next;
      });
    }, 200);
  }, []);

  useEffect(() => {
    startMission(missionIndex);
  }, [missionIndex]);

  // ─── Verificar missão completa ────────────────────────────────────────────
  useEffect(() => {
    if (correctHits >= mission.requiredCorrect && !missionComplete && !isFinished) {
      setMissionComplete(true);
      stopTimers();
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        if (missionIndex < MISSIONS.length - 1) {
          setMissionIndex((i) => i + 1);
          setScore((s) => s + 1);
        } else {
          setScore((s) => s + 1);
          setIsFinished(true);
        }
      }, 2000);
    }
  }, [correctHits]);

  // ─── Salvar progresso ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFinished) return;
    completeGame(score, MISSIONS.length);
  }, [isFinished]);

  // ─── Tap em círculo ───────────────────────────────────────────────────────
  const handleTap = useCallback((id: string, isCorrect: boolean) => {
    setTappedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      tappedIdsRef.current = next;
      return next;
    });
    // Tira da tela um pouco após o tap (animação acontece antes)
    setTimeout(() => {
      setCircles((prev) => prev.filter((c) => c.id !== id));
      circleCountRef.current = Math.max(0, circleCountRef.current - 1);
    }, 350);

    if (isCorrect) {
      playSound('correct');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCorrectHits((c) => c + 1);
      setCometProgress((prev) => Math.max(0, prev - 15)); // Empurra o cometa para trás!
    } else {
      playSound('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCometProgress((prev) => Math.min(100, prev + 15)); // Cometa avança mais rápido!
    }
  }, []);

  // ─── Game Over ────────────────────────────────────────────────────────────
  if (gameOver) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverEmoji}>☄️💥</Text>
          <Text style={styles.gameOverTitle}>Base Destruída!</Text>
          <Text style={styles.gameOverSub}>O cometa chegou... mas você pode tentar de novo!</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setGameOver(false);
              setMissionIndex(0);
              setBaseHp(3);
              setScore(0);
              startMission(0); // Força o reinício caso missionIndex já seja 0
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonSmall}
            onPress={() => { playSound('click'); router.back(); }}
          >
            <Text style={styles.backButtonSmallText}>Voltar para a Trilha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cometColor = cometProgress > 75 ? '#ef4444' : cometProgress > 50 ? '#f59e0b' : '#22c55e';

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playSound('click'); setShowExitModal(true); }} style={styles.backButton}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mestre da Galáxia</Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{missionIndex + 1}/{MISSIONS.length}</Text>
        </View>
      </View>

      {/* Banner da missão */}
      <Animated.View entering={ZoomIn} key={`mission-${missionIndex}`} style={styles.missionBanner}>
        <Text style={styles.missionEmoji}>{mission.emoji}</Text>
        <View style={styles.missionTexts}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionSub}>{mission.subtitle}</Text>
        </View>
        <View style={[styles.hitBadge, correctHits >= mission.requiredCorrect && styles.hitBadgeDone]}>
          <Text style={styles.hitBadgeText}>{correctHits}/{mission.requiredCorrect}</Text>
        </View>
      </Animated.View>

      {/* Vidas + Barra do cometa */}
      <View style={styles.statusRow}>
        <View style={styles.livesRow}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text key={i} style={{ fontSize: 18, opacity: i < baseHp ? 1 : 0.3 }}>
              {i < baseHp ? '❤️' : '🖤'}
            </Text>
          ))}
        </View>
        <View style={styles.cometBarWrap}>
          <Text style={{ fontSize: 16 }}>☄️</Text>
          <View style={styles.cometBarBg}>
            <View style={[styles.cometBarFill, { width: `${cometProgress}%`, backgroundColor: cometColor }]} />
          </View>
          <ShieldCheck size={17} color="#22c55e" />
        </View>
      </View>

      {/* Impacto do cometa */}
      {cometHit && (
        <Animated.View entering={BounceIn} style={styles.cometImpactBanner}>
          <Text style={styles.cometImpactText}>💥 O cometa atingiu a base!</Text>
        </Animated.View>
      )}

      {/* Área de jogo */}
      <View style={styles.gameArea}>

        {/* Missão completa */}
        {missionComplete && (
          <Animated.View entering={BounceIn} style={styles.completeBanner}>
            <Text style={styles.completeText}>✨ Missão Completa!</Text>
            <Text style={styles.completeSub}>Cometa destruído! 💥</Text>
          </Animated.View>
        )}

        {/* Círculos caindo */}
        {circles.map((circle) => {
          const isTapped = tappedIds.has(circle.id);
          return (
            <FallingCircle
              key={circle.id}
              circle={circle}
              isTapped={isTapped}
              fallDuration={mission.fallDuration}
              onTap={handleTap}
            />
          );
        })}

        {/* Base */}
        <View style={styles.base}>
          <Text style={{ fontSize: 28 }}>🛸</Text>
          <Text style={styles.baseLabel}>BASE ESPACIAL</Text>
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

// ─── Círculo Caindo ───────────────────────────────────────────────────────────
function FallingCircle({
  circle,
  isTapped,
  fallDuration,
  onTap,
}: {
  circle: Circle;
  isTapped: boolean;
  fallDuration: number;
  onTap: (id: string, isCorrect: boolean) => void;
}) {
  // Calcula a altura disponível para cair (gameArea = tela - headers - base)
  const fallDistance = SCREEN_HEIGHT * 0.54;

  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 11, stiffness: 140 });
    translateY.value = withTiming(fallDistance, { duration: fallDuration, easing: Easing.linear });
  }, []);

  useEffect(() => {
    if (isTapped) {
      if (circle.isCorrect) {
        scale.value = withSequence(withSpring(1.7, { damping: 7 }), withTiming(0, { duration: 220 }));
        opacity.value = withTiming(0, { duration: 270 });
      } else {
        scale.value = withSequence(withTiming(0.6, { duration: 70 }), withTiming(0, { duration: 200 }));
        opacity.value = withTiming(0, { duration: 280 });
      }
    }
  }, [isTapped]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const isTextLabel = circle.label.length > 1 || /[0-9]/.test(circle.label);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isTapped}
      onPress={() => onTap(circle.id, circle.isCorrect)}
      style={[styles.circleTouch, { left: circle.x }]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: circle.size,
            height: circle.size,
            borderRadius: circle.size / 2,
            backgroundColor: circle.bgColor,
            borderColor: circle.color,
            shadowColor: circle.color,
          },
          isTapped && circle.isCorrect && { borderColor: '#22c55e', backgroundColor: '#052e16' },
          isTapped && !circle.isCorrect && { borderColor: '#ef4444', backgroundColor: '#2a0a0a' },
          animStyle,
        ]}
      >
        {isTextLabel ? (
          <Text style={[styles.circleText, { color: circle.color, fontSize: circle.size > 68 ? 17 : 15 }]}>
            {circle.label}
          </Text>
        ) : (
          <Text style={{ fontSize: circle.size > 68 ? 30 : 26 }}>{circle.label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#06040f' },

  header: {
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#110a2e',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  progressPill: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  progressText: { color: '#f87171', fontWeight: 'bold', fontSize: 14 },

  missionBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#1a0a3e',
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  missionEmoji: { fontSize: 26 },
  missionTexts: { flex: 1 },
  missionTitle: { color: '#e0e7ff', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  missionSub: { color: '#6366f1', fontSize: 11, marginTop: 2 },
  hitBadge: {
    backgroundColor: '#052e16',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },
  hitBadgeDone: { backgroundColor: '#166534', borderColor: '#4ade80' },
  hitBadgeText: { color: '#4ade80', fontWeight: '900', fontSize: 14 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 8,
    gap: 10,
  },
  livesRow: { flexDirection: 'row', gap: 3 },
  cometBarWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cometBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#1e1145',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e2560',
  },
  cometBarFill: { height: '100%', borderRadius: 4 },

  cometImpactBanner: {
    marginHorizontal: 14,
    marginTop: 6,
    backgroundColor: '#2a0a0a',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  cometImpactText: { color: '#f87171', fontWeight: '800', fontSize: 13 },

  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 4,
  },

  circleTouch: { position: 'absolute', top: 0, zIndex: 10 },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  circleText: { fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },

  base: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(17,10,46,0.9)',
    borderTopWidth: 1.5,
    borderTopColor: '#2e2560',
  },
  baseLabel: { color: '#4f46e5', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 1 },

  completeBanner: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: '#052e16',
    borderColor: '#22c55e',
    borderWidth: 2.5,
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  completeText: { color: '#4ade80', fontSize: 22, fontWeight: '900' },
  completeSub: { color: '#86efac', fontSize: 14, marginTop: 5 },

  // Game Over
  gameOverContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#06040f' },
  gameOverEmoji: { fontSize: 60, marginBottom: 16 },
  gameOverTitle: { fontSize: 32, fontWeight: '900', color: '#ef4444', marginBottom: 10, textAlign: 'center' },
  gameOverSub: { fontSize: 16, color: '#94a3b8', marginBottom: 36, textAlign: 'center', lineHeight: 24 },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  retryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButtonSmall: { paddingVertical: 10, paddingHorizontal: 20 },
  backButtonSmallText: { color: '#6366f1', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },

  // Vitória
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.3, marginBottom: 16 },
  finishedTitle: { fontSize: 30, fontWeight: '900', color: '#f87171', marginBottom: 10, textAlign: 'center' },
  finishedSubtitle: { fontSize: 17, color: '#94a3b8', marginBottom: 36, textAlign: 'center', lineHeight: 25 },
  backButtonLarge: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  backButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});
