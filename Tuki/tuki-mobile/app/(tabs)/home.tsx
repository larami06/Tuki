import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookOpen, Star, Sparkles, Trophy, Flame, Coins, LogOut } from 'lucide-react-native';

export default function Home() {
  const router = useRouter();
  const { nome } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Superior */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <Text style={styles.greeting}>Olá, {nome || 'Joaozinho'}! 👋</Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.replace('/')}
          >
            <LogOut size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Linha de Status (Stats) */}
        <View style={styles.statsRow}>
          <Text style={styles.stat}><Star color="#f59e0b" size={16} /> 24</Text>
          <Text style={styles.stat}><Coins color="#d97706" size={16} /> 150</Text>
          <Text style={styles.stat}><Flame color="#ef4444" size={16} /> 5 dias</Text>
          <View style={styles.xpBox}>
            <Text style={styles.xpText}>320 XP</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner Hora de Aprender */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hora de aprender! 🎉</Text>
          <Text style={styles.bannerSub}>Continue sua jornada de descobertas</Text>
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>✨ Continuar</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Exploração */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.grid}>
          {[{ title: 'Alfabetização', icon: BookOpen }, { title: 'Matemática', icon: Star },
          { title: 'Histórias', icon: Sparkles }, { title: 'Conquistas', icon: Trophy }].map((item, i) => (
            <TouchableOpacity key={i} style={styles.card}>
              <item.icon size={32} color="#7c3aed" />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View style={styles.navBar}>
        {['Início', 'Atividades', 'Loja', 'Perfil'].map((item) => (
          <TouchableOpacity key={item} style={styles.navItem}>
            <Text style={styles.navLabel}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  headerStats: { padding: 20, paddingTop: 40 },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 15, marginTop: 10, alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', fontWeight: '600' },
  xpBox: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontWeight: 'bold' },
  content: { padding: 20 },
  banner: { backgroundColor: '#7c3aed', padding: 20, borderRadius: 20, marginBottom: 20 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bannerSub: { color: '#ddd', marginBottom: 15 },
  continueButton: { backgroundColor: '#fbbf24', padding: 12, borderRadius: 20, alignItems: 'center' },
  continueButtonText: { fontWeight: 'bold', color: '#000' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  card: { width: '45%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  cardText: { marginTop: 10, fontWeight: '600' },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#6b7280' },
  headerContainer: {
    padding: 20,
    paddingTop: 40
  },
  greetingWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
});