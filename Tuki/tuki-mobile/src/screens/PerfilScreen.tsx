import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../services/api';
import { obterPerfilAtivo } from '../services/storage';
import { BookOpen, Star, Flame, TrendingUp, Trophy, Target, Home, Book, LogOut, ShoppingBag, User } from 'lucide-react-native';

interface Usuario {
  id: number;
  nick: string;
  idade: number;
  avatar: string;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
}

const AVATARES_MAP: Record<string, string> = {
  avatar_1: '🐸',
  avatar_2: '🐼',
  avatar_3: '🦊',
  avatar_4: '🦁',
  avatar_5: '🐱',
};

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const sair = async () => {
    router.replace('/selecionar-perfil');
  };

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await obterPerfilAtivo();
      if (perfil) {
        setUsuario(perfil);
      }
    };
    carregarPerfil();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Cabeçalho Roxo */}
        <View style={styles.header}>

          <TouchableOpacity style={styles.logoutButton} onPress={sair}>
            <LogOut size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {usuario?.avatar ? (AVATARES_MAP[usuario.avatar] || '👤') : '👤'}
            </Text>
          </View>
          <Text style={styles.name}>{usuario?.nick || 'Visitante'}</Text>
          <Text style={styles.levelSubtitle}>
            {usuario?.idade ? `${usuario.idade} anos` : 'Idade não informada'} • Nível 4
          </Text>

          <View style={styles.levelProgressContainer}>
            <View style={styles.levelLabels}>
              <Text style={styles.levelLabel}>Nível 4</Text>
              <Text style={styles.levelLabel}>Nível 5</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '64%' }]} />
            </View>
            <Text style={styles.xpText}>320 / 500 XP</Text>
          </View>
        </View>

        {/* Cards de Status */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <BookOpen size={24} color="#7c3aed" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Lições</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#f59e0b" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Estrelas</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={24} color="#ef4444" />
            <Text style={styles.statValue}>5 dias</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statValue}>320</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
        </View>

        {/* Seção Progresso */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#7c3aed" />
            <Text style={styles.sectionTitle}>Progresso</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Alfabetização</Text>
              <Text style={styles.progressPercent}>75%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: '75%', backgroundColor: '#7c3aed' }]} />
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Matemática</Text>
              <Text style={styles.progressPercent}>45%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: '45%', backgroundColor: '#f97316' }]} />
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Cognitivo</Text>
              <Text style={styles.progressPercent}>30%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: '30%', backgroundColor: '#22c55e' }]} />
            </View>
          </View>
        </View>

        {/* Seção Conquistas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Conquistas</Text>
          </View>
        </View>

      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Home size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Book size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ShoppingBag size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <User size={24} color="#7c3aed" />
          <Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  scrollContent: { paddingBottom: 100 },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: 50,
    paddingBottom: 70,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 20,
  },
  levelProgressContainer: {
    width: '80%',
  },
  levelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  levelLabel: {
    color: '#e9d5ff',
    fontSize: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#5b21b6',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  xpText: {
    color: '#e9d5ff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: -40,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    width: '23%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 10,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  subjectBarBg: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  subjectBarFill: {
    height: 10,
    borderRadius: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
