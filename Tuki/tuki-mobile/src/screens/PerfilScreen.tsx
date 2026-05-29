import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL, buscarProgressoDoUsuario, ProgressoResponseDto, buscarUsuarioPorId } from '../services/api';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { BookOpen, Star, Flame, TrendingUp, Trophy, Target, Home, Book, LogOut, ShoppingBag, User } from 'lucide-react-native';

interface Usuario {
  id: number;
  nick: string;
  idade: number;
  avatar: string;
  tema: string;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
  xp: number;
}

const AVATARES_MAP: Record<string, any> = {
  avatar_1: require('../../assets/images/avatar_1.jpg'),
  avatar_2: require('../../assets/images/avatar_2.jpg'),
  avatar_3: require('../../assets/images/avatar_3.jpg'),
  avatar_4: require('../../assets/images/avatar_4.jpg'),
  avatar_5: require('../../assets/images/avatar_5.jpg'),
};

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [progressos, setProgressos] = useState<ProgressoResponseDto[]>([]);
  
  const sair = async () => {
    router.replace('/selecionar-perfil');
  };

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        const perfil = await obterPerfilAtivo();
        if (perfil) {
          try {
            const perfilAtualizado = await buscarUsuarioPorId(perfil.id);
            setUsuario(perfilAtualizado);
            await salvarPerfilAtivo(perfilAtualizado);
          } catch (err) {
            console.error("Erro ao carregar perfil atualizado do banco:", err);
            setUsuario(perfil);
          }

          try {
            const prog = await buscarProgressoDoUsuario(perfil.id);
            setProgressos(prog);
          } catch (err) {
            console.error("Erro ao carregar progresso:", err);
          }
        }
      };
      carregarDados();
    }, [])
  );

  // Função para calcular progresso médio por matéria
  const calcularProgressoPorMateria = (materia: string) => {
    const normalizeString = (str: string) => 
      str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

    const filtrados = progressos.filter(p => normalizeString(p.materia) === normalizeString(materia));
    if (filtrados.length === 0) return 0;
    
    // Supondo que o progresso seja baseado no número de lições concluídas sobre um total fictício de 10 por enquanto
    const concluidas = filtrados.filter(p => p.concluida).length;
    return Math.min(Math.round((concluidas / 10) * 100), 100); // 10 é um valor base exemplo
  };

  const progAlfabetizacao = calcularProgressoPorMateria('Alfabetizacao');
  const progMatematica = calcularProgressoPorMateria('Matematica');
  const progHistorias = calcularProgressoPorMateria('Historias');

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor={usuario?.tema || '#7c3aed'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Cabeçalho */}
        <View style={[styles.header, { backgroundColor: usuario?.tema || '#7c3aed' }]}>

          <TouchableOpacity style={styles.logoutButton} onPress={sair}>
            <LogOut size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            {usuario?.avatar && AVATARES_MAP[usuario.avatar]
              ? <Image source={AVATARES_MAP[usuario.avatar]} style={{ width: 70, height: 70, borderRadius: 35 }} />
              : <Text style={styles.avatarEmoji}>👤</Text>
            }
          </View>
          <Text style={styles.name}>{usuario?.nick || 'Visitante'}</Text>
          <Text style={styles.levelSubtitle}>
            {usuario?.idade ? `${usuario.idade} anos` : 'Idade não informada'} • Nível {Math.floor((usuario?.xp || 0) / 100) + 1}
          </Text>

          <View style={styles.levelProgressContainer}>
            <View style={styles.levelLabels}>
              <Text style={styles.levelLabel}>Nível {Math.floor((usuario?.xp || 0) / 100) + 1}</Text>
              <Text style={styles.levelLabel}>Nível {Math.floor((usuario?.xp || 0) / 100) + 2}</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${(usuario?.xp || 0) % 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{(usuario?.xp || 0) % 100} / 100 XP para o próximo nível</Text>
          </View>
        </View>

        {/* Cards de Status */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <BookOpen size={24} color="#7c3aed" />
            <Text style={styles.statValue}>{usuario?.licoesConcluidas || 0}</Text>
            <Text style={styles.statLabel}>Lições</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{usuario?.estrelas || 0}</Text>
            <Text style={styles.statLabel}>Estrelas</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={24} color="#ef4444" />
            <Text style={styles.statValue}>{usuario?.streakAtual || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statValue}>{usuario?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
        </View>

        {/* Seção Progresso */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#7c3aed" />
            <Text style={styles.sectionTitle}>Progresso Real</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Alfabetização</Text>
              <Text style={styles.progressPercent}>{progAlfabetizacao}%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: `${progAlfabetizacao}%`, backgroundColor: '#7c3aed' }]} />
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Matemática</Text>
              <Text style={styles.progressPercent}>{progMatematica}%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: `${progMatematica}%`, backgroundColor: '#f97316' }]} />
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Histórias</Text>
              <Text style={styles.progressPercent}>{progHistorias}%</Text>
            </View>
            <View style={styles.subjectBarBg}>
              <View style={[styles.subjectBarFill, { width: `${progHistorias}%`, backgroundColor: '#22c55e' }]} />
            </View>
          </View>
        </View>

        {/* Seção Conquistas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Conquistas</Text>
          </View>
          <TouchableOpacity style={styles.inventarioBtn} onPress={() => router.push('/inventario' as any)}>
            <Text style={styles.inventarioBtnText}>🎒 Meu Inventário</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Home size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/atividades')}>
          <Book size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/loja' as any)}>
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
  inventarioBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
  },
  inventarioBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
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
