import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, CheckCircle2 } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

// ── Dados dos níveis ────────────────────────────────────────────────────────
const BASE_LEVELS = [
  { idLicao: 30, title: 'Contando Estrelas',   icon: 'numeric',         color: '#6366f1', route: '/contando-estrelas' },
  { idLicao: 31, title: 'Soma Espacial',        icon: 'plus-circle',     color: '#a855f7', route: '/soma-espacial' },
  { idLicao: 32, title: 'Subtração Lunar',      icon: 'minus-circle',    color: '#ec4899', route: '/subtracao-lunar' },
  { idLicao: 33, title: 'Formas Geométricas',   icon: 'shape',           color: '#3b82f6', route: '/formas-geometricas' },
  { idLicao: 34, title: 'Maior ou Menor?',      icon: 'scale-balance',   color: '#10b981', route: '/maior-ou-menor' },
  { idLicao: 35, title: 'Lógica Alienígena',    icon: 'alien',           color: '#f59e0b', route: '/logica-alienigena' },
  { idLicao: 36, title: 'Mestre da Galáxia',    icon: 'rocket-launch',   color: '#ef4444', route: '/mestre-da-galaxia' },
];

const TRAIL_IDS = BASE_LEVELS.map(l => l.idLicao);

// ── Geometria do conector ───────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const SCROLL_PAD  = 30;   // paddingHorizontal do ScrollView
const TRAIL_PAD   = 20;   // paddingHorizontal do trailContainer
const TRAIL_W     = SCREEN_W - (SCROLL_PAD + TRAIL_PAD) * 2;
const WRAPPER_W   = TRAIL_W * 0.55;
const LEFT_CX     = WRAPPER_W / 2;           // centro X do botão alinhado à esquerda
const RIGHT_CX    = TRAIL_W - WRAPPER_W / 2; // centro X do botão alinhado à direita
const CONN_H      = 60;                       // altura da faixa de conector
const DX          = RIGHT_CX - LEFT_CX;
const CONN_LEN    = Math.sqrt(DX * DX + CONN_H * CONN_H);
const CONN_ANGLE  = Math.atan2(CONN_H, DX) * (180 / Math.PI);
const CONN_CX     = (LEFT_CX + RIGHT_CX) / 2;

// ── Componente de conector ─────────────────────────────────────────────────
function TrailConnector({ goingRight, completed }: { goingRight: boolean; completed: boolean }) {
  return (
    <View style={styles.connectorRow}>
      <View
        style={[
          styles.connectorLine,
          completed && styles.connectorLineDone,
          { transform: [{ rotate: `${goingRight ? CONN_ANGLE : -CONN_ANGLE}deg` }] },
        ]}
      />
    </View>
  );
}

// ── Screen principal ────────────────────────────────────────────────────────
export default function TrilhaMatematicaScreen() {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            const progresso = await buscarProgressoDoUsuario(perfil.id);
            const concluidas = progresso
              .filter(p => p.concluida && TRAIL_IDS.includes(p.idLicao))
              .map(p => p.idLicao);
            setCompletedIds(concluidas);
          }
        } catch (e) {
          console.error('Erro ao buscar progresso:', e);
        }
      };
      fetchProgress();
    }, [])
  );

  const levels = BASE_LEVELS.map((level, idx) => {
    const concluido = completedIds.includes(level.idLicao);
    const anterior  = idx === 0 || completedIds.includes(BASE_LEVELS[idx - 1].idLicao);
    const status    = concluido ? 'completed' : anterior ? 'current' : 'locked';
    return { ...level, status };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Matemática</Text>
          <Text style={styles.subtitle}>Aventura Espacial 🚀</Text>
        </View>
        <View style={styles.statsHeader}>
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.statsText}>{completedIds.length}/{BASE_LEVELS.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isLeft     = index % 2 === 0;
            const isLocked   = level.status === 'locked';
            const isCurrent  = level.status === 'current';
            const isComplete = level.status === 'completed';
            // conector antes deste nó vai R→L (par) ou L→R (ímpar)
            const goingRight = index % 2 === 1;

            return (
              <React.Fragment key={level.idLicao}>
                {index > 0 && (
                  <TrailConnector
                    goingRight={goingRight}
                    completed={completedIds.includes(BASE_LEVELS[index - 1].idLicao)}
                  />
                )}

                <View style={[styles.levelWrapper, { alignSelf: isLeft ? 'flex-start' : 'flex-end' }]}>
                  {/* Número do nível */}
                  <View style={[styles.levelNum, isLocked && styles.levelNumLocked]}>
                    <Text style={styles.levelNumText}>{index + 1}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.levelButton,
                      { backgroundColor: isLocked ? '#1e293b' : level.color },
                      isCurrent  && styles.currentLevel,
                      isComplete && styles.completedLevel,
                    ]}
                    disabled={isLocked}
                    onPress={() => router.push(level.route as any)}
                    activeOpacity={0.8}
                  >
                    {isLocked ? (
                      <Lock size={30} color="#475569" />
                    ) : (
                      <MaterialCommunityIcons name={level.icon as any} size={40} color="#fff" />
                    )}

                    {isCurrent && (
                      <View style={styles.playBadge}>
                        <Play size={11} color="#fff" fill="#fff" />
                      </View>
                    )}
                    {isComplete && (
                      <View style={styles.checkBadge}>
                        <CheckCircle2 size={18} color="#fff" fill="#22c55e" strokeWidth={2} />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelTitle, isLocked && styles.lockedText]} numberOfLines={2}>
                      {level.title}
                    </Text>
                    {isComplete && (
                      <View style={styles.stars}>
                        {[0, 1, 2].map(i => (
                          <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a' },

  // ── Header
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12 },
  headerTextContainer: { flex: 1, marginLeft: 14 },
  title:    { color: '#fff', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#bfdbfe', fontSize: 13, marginTop: 2 },
  statsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
  },
  statsText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  // ── Scroll / container
  scrollContent:  { paddingHorizontal: SCROLL_PAD, paddingTop: 28, paddingBottom: 100 },
  trailContainer: { paddingHorizontal: TRAIL_PAD },

  // ── Conector
  connectorRow: {
    height: CONN_H,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: CONN_CX - CONN_LEN / 2,
    top: CONN_H / 2 - 3,
    width: CONN_LEN,
    height: 6,
    backgroundColor: '#1e3a5f',
    borderRadius: 3,
  },
  connectorLineDone: {
    backgroundColor: '#3b82f6',
  },

  // ── Nó de nível
  levelWrapper: {
    width: WRAPPER_W,
    alignItems: 'center',
  },
  levelNum: {
    backgroundColor: '#1e3a5f',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelNumLocked: { backgroundColor: '#0f172a' },
  levelNumText: { color: '#60a5fa', fontSize: 11, fontWeight: '900' },

  levelButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  currentLevel: {
    borderWidth: 5,
    borderColor: '#ffffff',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
    transform: [{ scale: 1.1 }],
  },
  completedLevel: {
    borderColor: '#22c55e',
    borderWidth: 4,
  },
  playBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: '#2563eb',
    padding: 6, borderRadius: 12,
    borderWidth: 2, borderColor: '#fff',
  },
  checkBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 1,
  },

  levelInfo: { marginTop: 10, alignItems: 'center', marginBottom: 8 },
  levelTitle: {
    fontSize: 13, fontWeight: '700',
    color: '#e2e8f0', textAlign: 'center',
    lineHeight: 18,
  },
  lockedText: { color: '#475569' },
  stars: { flexDirection: 'row', gap: 2, marginTop: 5 },
});
