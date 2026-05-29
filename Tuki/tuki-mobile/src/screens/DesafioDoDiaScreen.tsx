import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import { playSound } from '../services/sound';
import {
  obterPerfilAtivo, salvarPerfilAtivo, salvarUltimoDesafio, verificarJogouHoje,
  adicionarDiamantes, obterDiamantes,
  // NÃO importamos atualizarStreak aqui — a roleta NÃO conta para streak
} from '../services/storage';
import { atualizarInventario } from '../services/api';
import { ROULETTE_SLICES, type RouletteSlice } from '../services/rewards';

// ─── Geometria da roleta ──────────────────────────────────────────────────────
const NUM_SLICES  = ROULETTE_SLICES.length;
const SLICE_ANGLE = 360 / NUM_SLICES;
const CX          = 140;
const CY          = 140;
const RADIUS      = 136;
const TEXT_RADIUS = 85;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(startAngle: number, endAngle: number) {
  const start    = polarToCartesian(CX, CY, RADIUS, startAngle);
  const end      = polarToCartesian(CX, CY, RADIUS, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

// ─── Descrição do prêmio ganho ────────────────────────────────────────────────
function prizeDescription(slice: RouletteSlice): string {
  if (slice.tipo === 'nada')       return 'Mais sorte amanhã! 😅';
  if (slice.tipo === 'diamantes')  return `+${slice.valor} diamante ${slice.label}`;
  if (slice.tipo === 'estrelas')   return `+${slice.valor} estrelas ⭐`;
  if (slice.tipo === 'xp')         return `+${slice.valor} XP ⚡`;
  return `+${slice.valor} moedas 🪙`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DesafioDoDiaScreen() {
  const router = useRouter();
  const [spinning, setSpinning]             = useState(false);
  const [prize, setPrize]                   = useState<RouletteSlice | null>(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [moedas, setMoedas]                 = useState(0);
  const [estrelas, setEstrelas]             = useState(0);
  const [diamantes, setDiamantes]           = useState(0);

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      const perfil = await obterPerfilAtivo();
      if (perfil) {
        setMoedas(perfil.moedas     || 0);
        setEstrelas(perfil.estrelas || 0);
        const d = await obterDiamantes(perfil.id);
        setDiamantes(d);
        setHasPlayedToday(await verificarJogouHoje(perfil.id));
      }
    };
    init();
  }, []);

  const spinRoulette = async () => {
    if (spinning || hasPlayedToday) return;
    playSound('click');
    setSpinning(true);
    setPrize(null);

    const prizeIndex    = Math.floor(Math.random() * NUM_SLICES);
    // Para que o centro da fatia `prizeIndex` chegue ao topo (0 graus ou 360 graus),
    // devemos rotacionar o inverso da sua posição atual.
    const sliceCenter   = prizeIndex * SLICE_ANGLE + SLICE_ANGLE / 2;
    const totalRotation = 5 * 360 + (360 - sliceCenter);
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: totalRotation,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      const selected = ROULETTE_SLICES[prizeIndex];
      setSpinning(false);
      setPrize(selected);
      setHasPlayedToday(true);
      playSound(selected.tipo === 'nada' ? 'wrong' : 'victory');

      const perfil = await obterPerfilAtivo();
      if (!perfil) return;

      let novasMoedas   = perfil.moedas   || 0;
      let novasEstrelas = perfil.estrelas || 0;
      let novoXP        = perfil.xp       || 0;
      let novosDiamantes = await obterDiamantes(perfil.id);

      if (selected.tipo === 'moedas')    { novasMoedas    += selected.valor; setMoedas(novasMoedas); }
      if (selected.tipo === 'estrelas')  { novasEstrelas  += selected.valor; setEstrelas(novasEstrelas); }
      if (selected.tipo === 'xp')        { novoXP         += selected.valor; }
      if (selected.tipo === 'diamantes') { novosDiamantes = await adicionarDiamantes(perfil.id, selected.valor); setDiamantes(novosDiamantes); }

      // Registra que jogou hoje (sem atualizar streak — roleta NÃO conta)
      await salvarUltimoDesafio(perfil.id);

      perfil.moedas    = novasMoedas;
      perfil.estrelas  = novasEstrelas;
      perfil.xp        = novoXP;
      perfil.diamantes = novosDiamantes;
      await salvarPerfilAtivo(perfil);

      try { await atualizarInventario(perfil.id, novasMoedas, novasEstrelas, novoXP); } catch {}
    });
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={26} color="#0D3B66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roleta Diária</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>🪙 {moedas}</Text></View>
          <View style={[styles.badge, styles.badgeDiamante]}><Text style={styles.badgeText}>💎 {diamantes}</Text></View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Roleta Diária!</Text>
        <Text style={styles.subtitle}>
          {hasPlayedToday && !prize ? 'Você já girou hoje 🌙' : 'Gire para ganhar moedas, estrelas, XP ou um raro diamante!'}
        </Text>

        {/* Mensagem "já jogou" */}
        {hasPlayedToday && !prize && (
          <View style={styles.playedContainer}>
            <Text style={styles.playedEmoji}>🌙</Text>
            <Text style={styles.playedText}>Você já girou hoje!</Text>
            <Text style={styles.playedSubText}>Volte amanhã para mais prêmios.</Text>
          </View>
        )}

        {/* Roleta */}
        {!hasPlayedToday && (
          <View style={styles.rouletteContainer}>
            <View style={styles.pointer} />
            <Animated.View style={{ transform: [{ rotate: spinRotation }] }}>
              <Svg width={280} height={280} viewBox="0 0 280 280">
                {ROULETTE_SLICES.map((item, index) => {
                  const startAngle = index * SLICE_ANGLE;
                  const endAngle   = (index + 1) * SLICE_ANGLE;
                  const midAngle   = startAngle + SLICE_ANGLE / 2;
                  const d          = slicePath(startAngle, endAngle);
                  return (
                    <G key={index}>
                      <Path d={d} fill={item.color} stroke="#fff" strokeWidth="2.5" />
                      <G transform={`rotate(${midAngle}, ${CX}, ${CY})`}>
                        <SvgText x={CX} y={CY - TEXT_RADIUS} fill="white"
                          fontSize="16" textAnchor="middle" alignmentBaseline="middle">
                          {item.label}
                        </SvgText>
                        <SvgText x={CX} y={CY - TEXT_RADIUS + 18}
                          fill="rgba(255,255,255,0.9)" fontSize="9"
                          textAnchor="middle" alignmentBaseline="middle">
                          {item.subLabel}
                        </SvgText>
                      </G>
                    </G>
                  );
                })}
                <Circle cx={CX} cy={CY} r="30" fill="white" stroke="#0D3B66" strokeWidth="4" />
                <SvgText x={CX} y={CY + 5} fill="#0D3B66" fontSize="12" fontWeight="bold" textAnchor="middle">
                  TUKI
                </SvgText>
              </Svg>
            </Animated.View>
          </View>
        )}

        {/* Botão girar */}
        {!hasPlayedToday && (
          <TouchableOpacity
            style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
            onPress={spinRoulette}
            disabled={spinning}
          >
            <Text style={styles.spinButtonText}>{spinning ? 'Girando...' : '🎰 GIRAR!'}</Text>
          </TouchableOpacity>
        )}

        {/* Resultado */}
        {prize && (
          <View style={[
            styles.prizeContainer,
            prize.tipo === 'diamantes' && styles.prizeContainerDiamante,
            prize.tipo === 'nada'      && styles.prizeContainerNada,
          ]}>
            <Text style={styles.prizeTitle}>
              {prize.tipo === 'nada' ? 'Quase lá! 😅' : prize.tipo === 'diamantes' ? '💎 DIAMANTE RARO!' : 'Parabéns! 🎉'}
            </Text>
            <Text style={styles.prizeValue}>{prizeDescription(prize)}</Text>
            <View style={styles.prizeStatsRow}>
              <Text style={styles.prizeStatItem}>🪙 {moedas}</Text>
              <Text style={styles.prizeStatItem}>⭐ {estrelas}</Text>
              <Text style={styles.prizeStatItem}>💎 {diamantes}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FAF6EE' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 16,
  },
  backButton:   { padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16 },
  headerTitle:  { fontSize: 20, fontWeight: '900', color: '#0D3B66' },
  badgeRow:     { flexDirection: 'row', gap: 6 },
  badge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16,
  },
  badgeDiamante: { backgroundColor: '#EFF6FF' },
  badgeText:     { fontSize: 13, fontWeight: '900', color: '#92400E' },

  content:  { flex: 1, alignItems: 'center', paddingTop: 8, paddingHorizontal: 20 },
  title:    { fontSize: 28, fontWeight: '900', color: '#FF5A5F', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, fontWeight: '600' },

  // já jogou
  playedContainer: {
    backgroundColor: '#F3F4F6', padding: 32, borderRadius: 24,
    alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', width: '100%',
  },
  playedEmoji:   { fontSize: 48, marginBottom: 12 },
  playedText:    { fontSize: 20, fontWeight: '900', color: '#4B5563', marginBottom: 8 },
  playedSubText: { fontSize: 14, color: '#6B7280', fontWeight: '600', textAlign: 'center' },

  // roleta
  rouletteContainer: {
    width: 300, height: 300,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  pointer: {
    position: 'absolute', top: -2, zIndex: 10,
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 14, borderRightWidth: 14, borderBottomWidth: 28,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#0D3B66', transform: [{ rotate: '180deg' }],
  },

  // botão
  spinButton: {
    backgroundColor: '#10B981', paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: 30, borderBottomWidth: 6, borderBottomColor: '#047857',
    elevation: 5, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  spinButtonDisabled: { backgroundColor: '#9CA3AF', borderBottomColor: '#6B7280' },
  spinButtonText:     { color: '#fff', fontSize: 22, fontWeight: '900' },

  // resultado
  prizeContainer: {
    marginTop: 16, backgroundColor: '#BAE6FD', padding: 24, borderRadius: 24,
    alignItems: 'center', borderWidth: 2, borderColor: '#38BDF8', width: '100%',
  },
  prizeContainerDiamante: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  prizeContainerNada:     { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  prizeTitle:    { fontSize: 22, fontWeight: '900', color: '#0369A1', marginBottom: 8 },
  prizeValue:    { fontSize: 26, fontWeight: '900', color: '#0284C7', marginBottom: 12 },
  prizeStatsRow: { flexDirection: 'row', gap: 16 },
  prizeStatItem: { fontSize: 14, fontWeight: '700', color: '#374151' },
});
