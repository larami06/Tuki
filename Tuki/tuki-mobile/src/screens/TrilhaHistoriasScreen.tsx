import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Book, Sparkles } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

const BASE_LEVELS = [
  { idLicao: 20, title: 'O Pequeno Tuki',      icon: 'egg-easter',      color: '#fbcfe8' },
  { idLicao: 21, title: 'Reino das Cores',      icon: 'palette',         color: '#f9a8d4' },
  { idLicao: 22, title: 'Amigos da Floresta',   icon: 'paw',             color: '#f472b6' },
  { idLicao: 23, title: 'Viagem ao Mar',         icon: 'waves',           color: '#db2777' },
  { idLicao: 24, title: 'Dragão Amigável',       icon: 'dragon',          color: '#be185d' },
  { idLicao: 25, title: 'Noite Estrelada',       icon: 'weather-night',   color: '#9d174d' },
  { idLicao: 26, title: 'Festa no Castelo',      icon: 'castle',          color: '#831843' },
];

export default function TrilhaHistoriasScreen() {
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
          <Text style={styles.title}>Histórias</Text>
          <Text style={styles.subtitle}>Contos Mágicos ✨</Text>
        </View>
        <View style={styles.statsHeader}>
          <Book size={20} color="#fff" />
          <Text style={styles.statsText}>{concluidos}/{total}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isCenter = index % 3 === 0;
            const isLeft = index % 3 === 1;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';
            const isCompleted = level.status === 'completed';

            return (
              <View
                key={level.idLicao}
                style={[
                  styles.levelWrapper,
                  { alignSelf: isCenter ? 'center' : isLeft ? 'flex-start' : 'flex-end' },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    { backgroundColor: isLocked ? '#fce7f3' : level.color },
                    isCurrent && styles.currentLevel,
                    isCompleted && styles.completedLevel,
                  ]}
                  disabled={isLocked}
                  onPress={() => router.push(`/historia/${level.idLicao}` as any)}
                >
                  {isLocked ? (
                    <Lock size={24} color="#f9a8d4" />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={42} color="#fff" />
                  )}

                  {isCurrent && (
                    <View style={styles.sparkleBadge}>
                      <Sparkles size={16} color="#fbbf24" fill="#fbbf24" />
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
  container: { flex: 1, backgroundColor: '#fff1f2' },
  header: {
    backgroundColor: '#ec4899',
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
  subtitle: { color: '#fce7f3', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statsText: { color: '#fff', fontWeight: 'bold' },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: { paddingHorizontal: 10 },
  levelWrapper: {
    marginBottom: 60,
    alignItems: 'center',
    width: '45%',
  },
  levelButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 6,
    borderColor: '#fff',
  },
  currentLevel: {
    transform: [{ scale: 1.1 }],
    borderColor: '#f472b6',
    borderStyle: 'dashed',
  },
  completedLevel: {
    borderColor: '#fbbf24',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelInfo: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 1,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9d174d',
    textAlign: 'center',
  },
  lockedText: { color: '#f9a8d4' },
  completedStars: { flexDirection: 'row', gap: 2, marginTop: 4 },
});
