import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, Rocket } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

const BASE_LEVELS = [
  { idLicao: 30, title: 'Contando Estrelas', icon: 'numeric', color: '#6366f1', route: '/contando-estrelas' },
  { idLicao: 31, title: 'Soma Espacial', icon: 'plus-circle', color: '#a855f7', route: '/soma-espacial' },
  { idLicao: 32, title: 'Subtração Lunar', icon: 'minus-circle', color: '#ec4899', route: '/subtracao-lunar' },
  { idLicao: 33, title: 'Formas Geométricas', icon: 'shape', color: '#3b82f6', route: '/formas-geometricas' },
  { idLicao: 34, title: 'Maior ou Menor?', icon: 'scale-balance', color: '#10b981', route: '/maior-ou-menor' },
  { idLicao: 35, title: 'Lógica Alienígena', icon: 'alien', color: '#f59e0b', route: '/logica-alienigena' },
  { idLicao: 36, title: 'Mestre da Galáxia', icon: 'rocket-launch', color: '#ef4444', route: '/mestre-da-galaxia' },
];

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
            const concluidas = progresso.filter(p => p.concluida).map(p => p.idLicao);
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
    const anterior = idx === 0 || completedIds.includes(BASE_LEVELS[idx - 1].idLicao);
    const status = concluido ? 'completed' : anterior ? 'current' : 'locked';
    return { ...level, status };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Matemática</Text>
          <Text style={styles.subtitle}>Aventura Espacial 🚀</Text>
        </View>
        <View style={styles.statsHeader}>
          <Rocket size={18} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.statsText}>{completedIds.length}/{BASE_LEVELS.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isLeft = index % 2 === 0;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';
            const isCompleted = level.status === 'completed';

            return (
              <View key={level.idLicao} style={[styles.levelWrapper, { alignSelf: isLeft ? 'flex-start' : 'flex-end' }]}>

                {/* Conector Visual */}
                {index > 0 && (
                  <View style={[
                    styles.connector,
                    {
                      left: isLeft ? 55 : -35,
                      transform: [{ rotate: isLeft ? '-20deg' : '20deg' }]
                    }
                  ]} />
                )}

                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { backgroundColor: isLocked ? '#1e293b' : level.color },
                    isCurrent && styles.currentLevel,
                    isCompleted && styles.completedLevel
                  ]}
                  disabled={isLocked}
                  onPress={() => { if (level.route) router.push(level.route as any); }}
                >
                  {isLocked ? (
                    <Lock size={28} color="#475569" />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={42} color="#fff" />
                  )}

                  {isCurrent && !isLocked && (
                    <View style={styles.playBadge}>
                      <Play size={12} color="#fff" fill="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, isLocked && styles.lockedText]}>{level.title}</Text>
                  {isCompleted && (
                    <View style={styles.completedStars}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#bfdbfe', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statsText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: { paddingHorizontal: 20 },
  levelWrapper: { marginBottom: 40, alignItems: 'center', width: '55%' },
  levelButton: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
    elevation: 6, borderWidth: 4, borderColor: 'rgba(255,255,255,0.1)',
  },
  currentLevel: { borderWidth: 6, borderColor: '#fff', transform: [{ scale: 1.15 }] },
  completedLevel: { borderColor: '#22c55e', borderWidth: 4 },
  playBadge: {
    position: 'absolute', bottom: -5, right: -5, backgroundColor: '#3b82f6',
    padding: 6, borderRadius: 12, borderWidth: 2, borderColor: '#fff',
  },
  levelInfo: { marginTop: 10, alignItems: 'center' },
  levelTitle: { fontSize: 14, fontWeight: 'bold', color: '#e2e8f0', textAlign: 'center' },
  lockedText: { color: '#475569' },
  completedStars: { flexDirection: 'row', marginTop: 4, gap: 2 },
  connector: {
    position: 'absolute', top: -35, width: 4, height: 50, backgroundColor: '#334155', zIndex: -1,
  }
});