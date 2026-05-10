import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookOpen, Star, Sparkles, Trophy, Flame, Coins, LogOut, Target, Home as HomeIcon, Book, ShoppingBag, User } from 'lucide-react-native';

interface Usuario {
  id: number;
  nick: string;
  idade: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { nome } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Busca os usuários cadastrados na API e pega o mais recente (último da lista)
    fetch('http://localhost:5276/api/Usuarios')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setUsuario(data[data.length - 1]);
        }
      })
      .catch(err => console.error("Erro ao buscar usuário:", err));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho Superior */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <Text style={styles.greeting}>Olá, {nome || usuario?.nick || 'Visitante'}! 👋</Text>

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
          {[
            { title: 'Alfabetização', icon: BookOpen, route: '/trilha-alfabetizacao', color: '#7c3aed' },
            { title: 'Matemática', icon: Star, route: '/trilha-matematica', color: '#fbbf24' },
            { title: 'Histórias', icon: Sparkles, route: '/trilha-historias', color: '#ec4899' },
            { title: 'Conquistas', icon: Trophy, route: '/conquistas', color: '#10b981' }
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.card}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <item.icon size={32} color={item.color} />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


      {/* Barra de Navegação Inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon size={24} color="#7c3aed" />
          <Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Book size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ShoppingBag size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/perfil')}>
          <User size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
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
