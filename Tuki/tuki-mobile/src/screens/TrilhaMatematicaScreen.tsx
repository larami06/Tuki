import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, Rocket } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

const BASE_LEVELS = [
  { idLicao: 30, title: 'Contando Estrelas',   icon: 'numeric',          color: '#6366f1', route: null },
  { idLicao: 31, title: 'Soma Espacial',        icon: 'plus-circle',      color: '#a855f7', route: null },
  { idLicao: 32, title: 'Subtração Lunar',      icon: 'minus-circle',     color: '#ec4899', route: null },
  { idLicao: 33, title: 'Formas Geométricas',   icon: 'shape',            color: '#3b82f6', route: null },
  { idLicao: 34, title: 'Maior ou Menor?',      icon: 'scale-balance',    color: '#10b981', route: null },
  { idLicao: 35, title: 'Lógica Alienígena',    icon: 'alien',            color: '#f59e0b', route: null },
  { idLicao: 36, title: 'Mestre da Galáxia',    icon: 'rocket-launch',    color: '#ef4444', route: null },
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

  const total = levels.length;
  const concluidos = levels.filter(l => l.status === 'completed').length;

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
          <Text style={styles.statsText}>{concluidos}/{total}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isRight = index % 2 !== 0;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';
            const isCompleted = level.status === 'completed';

            return (
              <View key={level.idLicao} style={[styles.levelWrapper, { alignSelf: isRight ? 'flex-end' : 'flex-start' }]}>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { backgroundColor: isLocked ? '#334155' : level.color },
                    isCurrent && styles.currentLevel,
                    isCompleted && styles.completedLevel,
                  ]}
                  disabled={isLocked || (!level.route && !isCompleted)}
                  onPress={() => {
                    if (level.route) router.push(level.route as any);
                  }}
                >
                  {isLocked ? (
                    <Lock size={24} color="#64748b" />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={42} color="#fff" />
                  )}

                  {isCurrent && !level.route && (
                    <View style={styles.emBreve}>
                      <Text style={styles.emBreveText}>Em breve</Text>
                    </View>
                  )}
                  {isCurrent && level.route && (
                    <View style={styles.playBadge}>
                      <Play size={12} color="#fff" fill="#fff" />
                    </View>
                  )}
                  {isCompleted && (
                    <View style={styles.checkBadge}>
                      <Star size={14} color="#fff" fill="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, isLocked && styles.lockedText]}>
                    {level.title}
                  </Text>
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
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#bfdbfe', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statsText: { color: '#fff', fontWeight: 'bold' },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: { paddingHorizontal: 20 },
  levelWrapper: {
    marginBottom: 50,
    alignItems: 'center',
    width: '50%',
  },
  levelButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currentLevel: {
    borderColor: '#fbbf24',
    borderWidth: 6,
    transform: [{ scale: 1.15 }],
  },
  completedLevel: {
    borderColor: '#22C55E',
    borderWidth: 5,
  },
  playBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f59e0b',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  emBreve: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  emBreveText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  levelInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  lockedText: { color: '#475569' },
  completedStars: { flexDirection: 'row', marginTop: 4, gap: 2 },
});
