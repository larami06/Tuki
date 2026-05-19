import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, Award } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { obterPerfilAtivo } from '../services/storage';
import { buscarProgressoDoUsuario } from '../services/api';

const BASE_LEVELS = [
  { id: 1, title: 'Vogais Mágicas', icon: 'format-letter-case', color: '#ff6b6b', route: '/vogais-magicas' },
  { id: 2, title: 'Encontro de Sons', icon: 'account-voice', color: '#4ecdc4', route: '/encontro-sons' },
  { id: 3, title: 'Família do B e C', icon: 'bee', color: '#45b7d1' },
  { id: 4, title: 'Palavras Curtas', icon: 'pencil', color: '#96ceb4' },
  { id: 5, title: 'Frases Divertidas', icon: 'balloon', color: '#ffeead' },
  { id: 6, title: 'Pequenos Contos', icon: 'book-open-page-variant', color: '#ffcc5c' },
  { id: 7, title: 'Desafio Final', icon: 'trophy', color: '#ff6f69' },
];

export default function TrilhaAlfabetizacaoScreen() {
  const router = useRouter();
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            const progresso = await buscarProgressoDoUsuario(perfil.id);
            const concluidas = progresso.filter(p => p.concluida).map(p => p.idLicao);
            setCompletedActivities(concluidas);
          }
        } catch (error) {
          console.error("Erro ao buscar progresso do banco:", error);
        }
      };
      fetchProgress();
    }, [])
  );

  const levels = BASE_LEVELS.map(level => {
    let status = 'locked';
    if (completedActivities.includes(level.id)) {
      status = 'completed';
    } else if (level.id === 1 || completedActivities.includes(level.id - 1)) {
      status = 'current';
    }
    return { ...level, status };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Alfabetização</Text>
          <Text style={styles.subtitle}>Mundo das Letras 🌳</Text>
        </View>
        <View style={styles.statsHeader}>
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.statsText}>12/50</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {levels.map((level, index) => {
            const isLeft = index % 2 === 0;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';

            return (
              <View key={level.id} style={[styles.levelWrapper, { alignSelf: isLeft ? 'flex-start' : 'flex-end' }]}>

                {/* Conector Visual (opcional, simplificado aqui) */}
                {index > 0 && (
                  <View style={[
                    styles.connector, 
                    { 
                      left: isLeft ? 60 : -40,
                      transform: [{ rotate: isLeft ? '-15deg' : '15deg' }]
                    }
                  ]} />
                )}

                <TouchableOpacity 
                  style={[
                    styles.levelButton, 
                    { backgroundColor: isLocked ? '#e5e7eb' : level.color },
                    isCurrent && styles.currentLevel
                  ]}
                  disabled={isLocked}
                  onPress={() => {
                    if (level.route) {
                      router.push(level.route as any);
                    } else {
                      router.push({ pathname: '/atividade' as any, params: { id: level.id, title: level.title } });
                    }
                  }}
                >
                  {isLocked ? (
                    <Lock size={24} color="#9ca3af" />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={42} color="#fff" />
                  )}
                  
                  {isCurrent && (
                    <View style={styles.playBadge}>
                      <Play size={12} color="#fff" fill="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, isLocked && styles.lockedText]}>
                    {level.title}
                  </Text>
                  {level.status === 'completed' && (
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
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    backgroundColor: '#7c3aed',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#e0e7ff', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: {
    paddingHorizontal: 20,
  },
  levelWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    width: '60%',
  },
  levelButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  currentLevel: {
    borderWidth: 6,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  levelEmoji: { fontSize: 32 },
  playBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#7c3aed',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  lockedText: { color: '#94a3b8' },
  completedStars: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  connector: {
    position: 'absolute',
    top: -30,
    width: 4,
    height: 40,
    backgroundColor: '#cbd5e1',
    zIndex: -1,
  }
});
