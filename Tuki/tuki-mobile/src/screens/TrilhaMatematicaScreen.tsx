import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Star, Lock, Play, Rocket } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LEVELS = [
  { id: 1, title: 'Contando Estrelas', status: 'completed', icon: 'numeric', color: '#6366f1' },
  { id: 2, title: 'Soma Espacial', status: 'completed', icon: 'plus-circle', color: '#a855f7' },
  { id: 3, title: 'Subtração Lunar', status: 'current', icon: 'minus-circle', color: '#ec4899' },
  { id: 4, title: 'Formas Geométricas', status: 'locked', icon: 'shape', color: '#3b82f6' },
  { id: 5, title: 'Maior ou Menor?', status: 'locked', icon: 'scale-balance', color: '#10b981' },
  { id: 6, title: 'Lógica Alienígena', status: 'locked', icon: 'alien', color: '#f59e0b' },
  { id: 7, title: 'Mestre da Galáxia', status: 'locked', icon: 'rocket-launch', color: '#ef4444' },
];

export default function TrilhaMatematicaScreen() {
  const router = useRouter();

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
          <Rocket size={20} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.statsText}>Nível 3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {LEVELS.map((level, index) => {
            const isRight = index % 2 !== 0;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';

            return (
              <View key={level.id} style={[styles.levelWrapper, { alignSelf: isRight ? 'flex-end' : 'flex-start' }]}>
                <TouchableOpacity 
                  style={[
                    styles.levelButton, 
                    { backgroundColor: isLocked ? '#334155' : level.color },
                    isCurrent && styles.currentLevel
                  ]}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <Lock size={24} color="#64748b" />
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
  },
  statsText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: {
    paddingHorizontal: 20,
  },
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
  levelEmoji: { fontSize: 36 },
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
  completedStars: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  }
});
