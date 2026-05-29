import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Book, Home as HomeIcon, ShoppingBag, User, Hash, BookOpen, Sparkles, Target, ChevronRight, Flame } from 'lucide-react-native';
import { playSound } from '../services/sound';
import { obterPerfilAtivo } from '../services/storage';
import { buscarUsuarioPorId } from '../services/api';
import { obterMissoesHoje, type MissionProgress } from '../services/missions';
import { obterDiamantes } from '../services/storage';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useCallback } from 'react';

interface ActivityCardProps {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  shadowColor3D: string;
  textColor: string;
  onPress?: () => void;
}

export default function AtividadesScreen() {
  const router = useRouter();
  const [streakAtual, setStreakAtual] = useState(0);
  const [moedas, setMoedas]           = useState(0);
  const [diamantes, setDiamantes]     = useState(0);
  const [missoes, setMissoes]         = useState<MissionProgress[]>([]);

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        const perfil = await obterPerfilAtivo();
        if (perfil) {
          setStreakAtual(perfil.streakAtual || 0);
          setMoedas(perfil.moedas || 0);
          const d = await obterDiamantes(perfil.id);
          setDiamantes(d);
          try {
            const atualizado = await buscarUsuarioPorId(perfil.id);
            setStreakAtual(atualizado.streakAtual || 0);
            setMoedas(atualizado.moedas || 0);
          } catch {}
          const m = await obterMissoesHoje(perfil.id);
          setMissoes(m);
        }
      };
      carregar();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EE" />

      <Text style={[styles.bgStar, { top: 140, left: 15 }]}>⭐</Text>
      <Text style={[styles.bgStar, { top: 320, right: 20, fontSize: 28 }]}>✨</Text>
      <Text style={[styles.bgStar, { bottom: 200, left: 25 }]}>🎈</Text>
      <Text style={[styles.bgStar, { top: 20, left: '40%', fontSize: 16 }]}>🔸</Text>

      {/* Barra de status */}
      <View style={styles.statusBarRewards}>
        <View style={styles.rewardBadge}>
          <Flame size={16} color="#F97316" fill="#F97316" />
          <Text style={styles.rewardText}>{streakAtual}</Text>
        </View>
        <View style={[styles.rewardBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={{ fontSize: 14 }}>🪙</Text>
          <Text style={[styles.rewardText, { color: '#854D0E' }]}>{moedas}</Text>
        </View>
        <View style={[styles.rewardBadge, { backgroundColor: '#EFF6FF' }]}>
          <Text style={{ fontSize: 14 }}>💎</Text>
          <Text style={[styles.rewardText, { color: '#1D4ED8' }]}>{diamantes}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.headerTitle}>Minhas</Text>
            <Text style={styles.headerTitleBold}>Atividades</Text>
          </View>
          <View style={styles.mascotAbsoluteContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Vamos aprender?!</Text>
            </View>
            <Image source={require('../../assets/images/tuki-oi.png')} style={styles.mascotImage} resizeMode="contain" />
          </View>
        </View>

        {/* Cards de trilha */}
        <View style={styles.cardsContainer}>
          <ActivityCard
            title="Alfabetização"
            icon={<BookOpen size={32} color="#FFFFFF" />}
            backgroundColor="#8B5CF6" shadowColor3D="#6D28D9" textColor="#FFFFFF"
            onPress={() => { playSound('click'); router.push('/trilha-alfabetizacao'); }}
          />
          <ActivityCard
            title="Matemática"
            icon={<Hash size={32} color="#FFFFFF" />}
            backgroundColor="#10B981" shadowColor3D="#047857" textColor="#FFFFFF"
            onPress={() => { playSound('click'); router.push('/trilha-matematica'); }}
          />
          <ActivityCard
            title="Histórias"
            icon={<Sparkles size={32} color="#FFFFFF" />}
            backgroundColor="#FF5A5F" shadowColor3D="#C92A30" textColor="#FFFFFF"
            onPress={() => { playSound('click'); router.push('/trilha-historias'); }}
          />
          <Animated.View style={pulseStyle}>
            <ActivityCard
              title="Roleta Diária"
              icon={<Target size={32} color="#1A1C20" />}
              backgroundColor="#FFD166" shadowColor3D="#D4A316" textColor="#1A1C20"
              onPress={() => { playSound('click'); router.push('/desafio-do-dia'); }}
            />
          </Animated.View>
        </View>

        {/* Missões do Dia */}
        {missoes.length > 0 && (
          <View style={styles.missionsSection}>
            <Text style={styles.missionsSectionTitle}>🎯 Missões do Dia</Text>
            {missoes.map(m => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/home'); }}>
          <HomeIcon size={24} color="#6b7280" /><Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Book size={24} color="#7c3aed" /><Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/loja' as any); }}>
          <ShoppingBag size={24} color="#6b7280" /><Text style={styles.navLabel}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/perfil'); }}>
          <User size={24} color="#6b7280" /><Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Componente de card de missão ─────────────────────────────────────────────
function MissionCard({ mission }: { mission: MissionProgress }) {
  const pct      = Math.min(mission.progresso / mission.meta, 1);
  const concluida = mission.concluida;

  // Ícone da recompensa
  const recompIcon = mission.recompensa.diamantes ? '💎'
    : mission.recompensa.moedas    ? '🪙'
    : mission.recompensa.estrelas  ? '⭐'
    : '⚡';
  const recompVal = mission.recompensa.diamantes || mission.recompensa.moedas || mission.recompensa.estrelas || mission.recompensa.xp || 0;

  return (
    <View style={[styles.missionCard, concluida && styles.missionCardDone]}>
      <View style={styles.missionCardHeader}>
        <Text style={styles.missionCardTitle}>{concluida ? '✅ ' : ''}{mission.titulo}</Text>
        <View style={styles.missionReward}>
          <Text style={styles.missionRewardText}>{recompIcon} +{recompVal}</Text>
        </View>
      </View>
      <Text style={styles.missionCardDesc}>{mission.descricao}</Text>
      <View style={styles.missionProgressRow}>
        <View style={styles.missionBarBg}>
          <View style={[styles.missionBarFill, concluida && styles.missionBarDone, { width: `${pct * 100}%` }]} />
        </View>
        <Text style={styles.missionProgressText}>{Math.min(mission.progresso, mission.meta)}/{mission.meta}</Text>
      </View>
    </View>
  );
}

// ─── Card de atividade ────────────────────────────────────────────────────────
const ActivityCard: React.FC<ActivityCardProps> = ({ title, icon, backgroundColor, shadowColor3D, textColor, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.card, { backgroundColor, borderBottomColor: shadowColor3D }]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      </View>
      <View style={styles.cardArrowCircle}>
        <ChevronRight size={20} color={textColor} style={{ opacity: 0.8 }} />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FAF6EE' },
  bgStar:      { position: 'absolute', fontSize: 22, opacity: 0.25, zIndex: 0 },

  statusBarRewards: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    zIndex: 20,
  },
  rewardBadge: {
    flexDirection: 'row', backgroundColor: '#FFEDD5',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, alignItems: 'center', gap: 5,
  },
  rewardText: { fontSize: 13, fontWeight: '900', color: '#1A1C20' },

  scrollContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },

  headerContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 28, minHeight: 120, position: 'relative',
  },
  headerTextWrapper: { width: '55%', flexDirection: 'column', alignItems: 'flex-start' },
  headerTitle:       { fontSize: 32, fontWeight: '900', color: '#0D3B66' },
  headerTitleBold:   { fontSize: 38, fontWeight: '900', color: '#0D3B66', marginTop: -4 },
  mascotAbsoluteContainer: {
    width: '45%', alignItems: 'flex-end', justifyContent: 'flex-end',
    position: 'absolute', right: -10, top: -10, zIndex: 5,
  },
  mascotImage:  { width: 130, height: 130 },
  speechBubble: {
    backgroundColor: '#BAE6FD', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, position: 'absolute', top: 115, alignSelf: 'center',
    zIndex: 10, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  speechText: { fontSize: 13.2, fontWeight: 'bold', color: '#0369A1', textAlign: 'center' },

  cardsContainer: { gap: 18, marginTop: 10, marginBottom: 24 },
  card: {
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 22,
    borderBottomWidth: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardContent:       { flexDirection: 'row', alignItems: 'center' },
  iconContainer:     { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.28)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTextContainer: { flex: 1, justifyContent: 'center' },
  cardTitle:         { fontSize: 24, fontWeight: '900' },
  cardArrowCircle:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // ── Missões
  missionsSection:      { gap: 12 },
  missionsSectionTitle: { fontSize: 18, fontWeight: '900', color: '#0D3B66', marginBottom: 4 },
  missionCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  missionCardDone: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  missionCardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  missionCardTitle:   { fontSize: 14, fontWeight: '900', color: '#1E293B', flex: 1 },
  missionReward:      { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  missionRewardText:  { fontSize: 12, fontWeight: '900', color: '#92400E' },
  missionCardDesc:    { fontSize: 12, color: '#64748B', marginBottom: 10 },
  missionProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missionBarBg:       { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  missionBarFill:     { height: '100%', backgroundColor: '#7C3AED', borderRadius: 4 },
  missionBarDone:     { backgroundColor: '#22C55E' },
  missionProgressText: { fontSize: 12, fontWeight: '700', color: '#64748B', minWidth: 30, textAlign: 'right' },

  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  navItem:  { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  navLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: '700' },
});
