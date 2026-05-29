import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Image, ScrollView, Platform,
} from 'react-native';
import type { GameCompletionState } from '../hooks/useGameCompletion';

interface Props {
  state: GameCompletionState;
  onContinue: () => void;
}

// ─── Contador animado de número ───────────────────────────────────────────────
function AnimatedCount({ target, delay = 0 }: { target: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      let current = 0;
      const steps  = Math.min(target, 25);
      const step   = Math.ceil(target / steps);
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayed(current);
        if (current >= target) clearInterval(interval);
      }, 40);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return <Text>{displayed}</Text>;
}

// ─── Linha de recompensa ──────────────────────────────────────────────────────
function RewardRow({ emoji, label, value, delay, highlight = false }: {
  emoji: string; label: string; value: number; delay: number; highlight?: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay, useNativeDriver: true, damping: 14 }),
    ]).start();
  }, []);

  if (value === 0) return null;

  return (
    <Animated.View style={[styles.rewardRow, highlight && styles.rewardRowHighlight, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.rewardEmoji}>{emoji}</Text>
      <Text style={[styles.rewardLabel, highlight && styles.rewardLabelHighlight]}>{label}</Text>
      <Text style={[styles.rewardValue, highlight && styles.rewardValueHighlight]}>
        +<AnimatedCount target={value} delay={delay} />
      </Text>
    </Animated.View>
  );
}

// ─── Barra de progresso de missão ─────────────────────────────────────────────
function MissionBar({ titulo, progresso, meta, acabouDeCompletar }: {
  titulo: string; progresso: number; meta: number; acabouDeCompletar: boolean;
}) {
  const pct = Math.min(progresso / meta, 1);
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: pct, duration: 600, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);

  return (
    <View style={styles.missionItem}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{acabouDeCompletar ? '✅ ' : ''}{titulo}</Text>
        <Text style={styles.missionProgress}>{Math.min(progresso, meta)}/{meta}</Text>
      </View>
      <View style={styles.missionBarBg}>
        <Animated.View style={[styles.missionBarFill, acabouDeCompletar && styles.missionBarDone, { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
    </View>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────
export default function GameCompletionModal({ state, onContinue }: Props) {
  const { reward, streak, missions } = state;

  const slideAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim,   { toValue: 0, damping: 16, stiffness: 120, useNativeDriver: true }),
    ]).start();

    // Mascot bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBounce, { toValue: -12, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(mascotBounce, { toValue: 0,   duration: 350, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const missoesMostradas = missions.filter(m => m.progrediu || m.acabouDeCompletar);
  const titulo = reward.perfeito ? 'PERFEITO! 🌟' : streak.subiu ? 'INCRÍVEL! 🔥' : 'PARABÉNS! 🎉';

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      {/* Overlay escurecido */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />

      {/* Card deslizante */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false} bounces={false}>

          {/* Mascote animado */}
          <Animated.View style={{ transform: [{ translateY: mascotBounce }] }}>
            <Image
              source={require('../../assets/images/happy-tuki.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Título */}
          <Text style={styles.title}>{titulo}</Text>

          {/* Recompensas */}
          <View style={styles.rewardsContainer}>
            <RewardRow emoji="🪙" label="moedas"   value={reward.moedas}   delay={100} />
            <RewardRow emoji="⭐" label="estrelas"  value={reward.estrelas} delay={200} />
            <RewardRow emoji="⚡" label="XP"        value={reward.xp}      delay={300} />
            <RewardRow emoji="💎" label="ruby"      value={reward.rubis}   delay={400} highlight />
          </View>

          {/* Streak */}
          {streak.subiu && (
            <Animated.View style={[styles.streakBadge, { opacity: overlayAnim }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>Streak: {streak.streakNovo} {streak.streakNovo === 1 ? 'dia' : 'dias'}!</Text>
                <Text style={styles.streakSub}>
                  {streak.resetou ? 'Recomeçou do zero 💪' : streak.streakNovo === 1 ? 'Primeiro dia!' : '+1 dia de sequência'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Missões progredidas */}
          {missoesMostradas.length > 0 && (
            <View style={styles.missionsSection}>
              <Text style={styles.missionsSectionTitle}>Missões do Dia</Text>
              {missoesMostradas.map(m => (
                <MissionBar
                  key={m.mission.id}
                  titulo={m.mission.titulo}
                  progresso={m.mission.progresso}
                  meta={m.mission.meta}
                  acabouDeCompletar={m.acabouDeCompletar}
                />
              ))}
            </View>
          )}

          {/* Botão continuar */}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue} activeOpacity={0.85}>
            <Text style={styles.continueText}>Continuar</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardWrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    maxHeight: '90%',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center',
  },

  // ── Mascote
  mascot: { width: 120, height: 120, marginBottom: 4 },

  // ── Título
  title: {
    fontSize: 28, fontWeight: '900', color: '#0D3B66',
    textAlign: 'center', marginBottom: 20,
  },

  // ── Recompensas
  rewardsContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  rewardRowHighlight: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  rewardEmoji: { fontSize: 22, width: 30 },
  rewardLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#475569' },
  rewardLabelHighlight: { color: '#92400E' },
  rewardValue: { fontSize: 22, fontWeight: '900', color: '#0D3B66' },
  rewardValueHighlight: { color: '#DC2626', fontSize: 24 },

  // ── Streak
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
  },
  streakEmoji:  { fontSize: 28 },
  streakTitle:  { fontSize: 16, fontWeight: '900', color: '#C2410C' },
  streakSub:    { fontSize: 12, color: '#EA580C', marginTop: 2 },

  // ── Missões
  missionsSection: { width: '100%', marginBottom: 20 },
  missionsSectionTitle: {
    fontSize: 13, fontWeight: '900', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  missionItem:   { marginBottom: 12 },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  missionTitle:  { fontSize: 13, fontWeight: '700', color: '#1E293B', flex: 1 },
  missionProgress: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  missionBarBg:  { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  missionBarFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 4 },
  missionBarDone: { backgroundColor: '#22C55E' },

  // ── Botão
  continueButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#5B21B6',
  },
  continueText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
