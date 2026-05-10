import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trophy, Medal, Star, Target } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BADGES = [
  { id: 1, title: 'Primeiros Passos', desc: 'Completou a primeira lição', icon: 'sprout', color: '#10b981' },
  { id: 2, title: 'Matemático Junior', desc: 'Acertou 10 somas', icon: 'abacus', color: '#3b82f6' },
  { id: 3, title: 'Leitor Curioso', desc: 'Lê 5 histórias', icon: 'book-open-variant', color: '#f59e0b' },
  { id: 4, title: 'Super Streak', desc: '5 dias seguidos', icon: 'fire', color: '#ef4444' },
];

export default function ConquistasScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Conquistas</Text>
        <Trophy size={28} color="#fbbf24" fill="#fbbf24" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.statItem}>
            <Medal size={32} color="#fbbf24" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Medalhas</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Star size={32} color="#f59e0b" />
            <Text style={styles.statValue}>450</Text>
            <Text style={styles.statLabel}>Estrelas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Medalhas Desbloqueadas</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={[styles.badgeIcon, { backgroundColor: badge.color + '20' }]}>
                <MaterialCommunityIcons name={badge.icon as any} size={32} color={badge.color} />
              </View>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Mostrar para o Papai/Mamãe 👨‍👩‍👧‍👦</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  header: {
    backgroundColor: '#10b981',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 8 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 4,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  divider: { width: 1, height: '80%', backgroundColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  badgeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: { fontSize: 30 },
  badgeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  badgeDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  shareButton: {
    backgroundColor: '#7c3aed',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
  },
  shareButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
