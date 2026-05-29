import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, CheckCircle2, X } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

// ── Dados dos níveis ────────────────────────────────────────────────────────
const BASE_LEVELS = [
  { idLicao: 1, title: 'Vogais Mágicas',    icon: 'format-letter-case',      color: '#ef4444', route: '/vogais-magicas' },
  { idLicao: 2, title: 'Encontro de Sons',   icon: 'account-voice',           color: '#06b6d4', route: '/encontro-sons' },
  { idLicao: 3, title: 'Família do B e C',   icon: 'bee',                     color: '#3b82f6', route: '/familia-b-c' },
  { idLicao: 4, title: 'Palavras Curtas',    icon: 'pencil',                  color: '#10b981', route: '/palavras-curtas' },
  { idLicao: 5, title: 'Frases Divertidas',  icon: 'balloon',                 color: '#f59e0b', route: '/frases-divertidas' },
  { idLicao: 6, title: 'Pequenos Contos',    icon: 'book-open-page-variant',  color: '#8b5cf6', route: '/pequenos-contos' },
  { idLicao: 7, title: 'Desafio Final',      icon: 'trophy',                  color: '#ec4899', route: '/desafio-final-alfabetizacao' },
];

const TRAIL_IDS = BASE_LEVELS.map(l => l.idLicao);

// ── Geometria do conector ───────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const SCROLL_PAD  = 30;
const TRAIL_PAD   = 20;
const TRAIL_W     = SCREEN_W - (SCROLL_PAD + TRAIL_PAD) * 2;
const WRAPPER_W   = TRAIL_W * 0.55;
const LEFT_CX     = WRAPPER_W / 2;
const RIGHT_CX    = TRAIL_W - WRAPPER_W / 2;
const CONN_H      = 60;
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
export default function TrilhaAlfabetizacaoScreen() {
  const router = useRouter();
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);
  const [modalNivel, setModalNivel] = useState<{ visivel: boolean; nivel: any | null }>({ visivel: false, nivel: null });
  const [loading, setLoading] = useState(false);

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
            setCompletedActivities(concluidas);
          }
        } catch (error) {
          console.error('Erro ao buscar progresso:', error);
        }
      };
      fetchProgress();
    }, [])
  );

  const levels = BASE_LEVELS.map((level, idx) => {
    const concluido = completedActivities.includes(level.idLicao);
    const anterior  = idx === 0 || completedActivities.includes(BASE_LEVELS[idx - 1].idLicao);
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
          <Text style={styles.title}>Alfabetização</Text>
          <Text style={styles.subtitle}>Mundo das Letras 🌳</Text>
        </View>
        <View style={styles.statsHeader}>
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.statsText}>{completedActivities.length}/{BASE_LEVELS.length}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isLeft     = index % 2 === 0;
            const isLocked   = level.status === 'locked';
            const isCurrent  = level.status === 'current';
            const isComplete = level.status === 'completed';
            const goingRight = index % 2 === 1;

            return (
              <React.Fragment key={level.idLicao}>
                {index > 0 && (
                  <TrailConnector
                    goingRight={goingRight}
                    completed={completedActivities.includes(BASE_LEVELS[index - 1].idLicao)}
                  />
                )}

                <View style={[styles.levelWrapper, { alignSelf: isLeft ? 'flex-start' : 'flex-end' }]}>
                  <View style={[styles.levelNum, isLocked && styles.levelNumLocked]}>
                    <Text style={styles.levelNumText}>{index + 1}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.levelButton,
                      { backgroundColor: isLocked ? '#e5e7eb' : level.color },
                      isCurrent  && styles.currentLevel,
                      isComplete && styles.completedLevel,
                    ]}
                    disabled={isLocked}
                    onPress={() => setModalNivel({ visivel: true, nivel: level })}
                    activeOpacity={0.8}
                  >
                    {isLocked ? (
                      <Lock size={28} color="#9ca3af" />
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

      {/* Modal de Resumo do Nível */}
      <Modal transparent animationType="slide" visible={modalNivel.visivel}>
        {modalNivel.nivel && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: modalNivel.nivel.color }]}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalNivel({ visivel: false, nivel: null })}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.modalIconWrapper}>
                <MaterialCommunityIcons name={modalNivel.nivel.icon as any} size={50} color={modalNivel.nivel.color} />
              </View>
              
              <Text style={styles.modalTitulo}>{modalNivel.nivel.title}</Text>
              
              {modalNivel.nivel.status === 'completed' ? (
                <View style={[styles.modalMeta, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <CheckCircle2 size={18} color="#fff" />
                  <Text style={styles.modalMetaText}>Você já concluiu esta atividade!</Text>
                </View>
              ) : (
                <Text style={styles.modalTeaser}>Prepare-se para este desafio! Você consegue!</Text>
              )}
              
              <TouchableOpacity
                onPress={() => {
                  const rota = modalNivel.nivel.route;
                  setModalNivel({ visivel: false, nivel: null });
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    router.push(rota);
                  }, 800);
                }}
                style={styles.modalBotaoComecar}
              >
                <Text style={styles.modalBotaoComecarText}>
                  {modalNivel.nivel.status === 'completed' ? 'Jogar Novamente 🔄' : 'Começar 🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando atividade...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0ff' },

  // ── Header
  header: {
    backgroundColor: '#7c3aed',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12 },
  headerTextContainer: { flex: 1, marginLeft: 14 },
  title:    { color: '#fff', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#ddd6fe', fontSize: 13, marginTop: 2 },
  statsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.18)',
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
    backgroundColor: '#ddd6fe',
    borderRadius: 3,
  },
  connectorLineDone: {
    backgroundColor: '#7c3aed',
  },

  // ── Nó de nível
  levelWrapper: {
    width: WRAPPER_W,
    alignItems: 'center',
  },
  levelNum: {
    backgroundColor: '#ede9fe',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelNumLocked: { backgroundColor: '#e5e7eb' },
  levelNumText: { color: '#7c3aed', fontSize: 11, fontWeight: '900' },

  levelButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  currentLevel: {
    borderWidth: 5,
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.5,
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
    backgroundColor: '#7c3aed',
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
    color: '#3b1d8a', textAlign: 'center',
    lineHeight: 18,
  },
  lockedText: { color: '#9ca3af' },
  stars: { flexDirection: 'row', gap: 2, marginTop: 5 },

  // ── Modals & Loading
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', borderRadius: 28, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
  modalClose: { position: 'absolute', top: 16, right: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20 },
  modalIconWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
  modalTitulo: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 16 },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginBottom: 20 },
  modalMetaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalTeaser: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24, fontWeight: '600', lineHeight: 22 },
  modalBotaoComecar: { backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20, width: '100%', alignItems: 'center', elevation: 4 },
  modalBotaoComecarText: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
});
