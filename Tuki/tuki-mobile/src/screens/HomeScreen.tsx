import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookOpen, Star, Sparkles, Trophy, Flame, Coins, Target, Home as HomeIcon, Book, ShoppingBag, User, Bell, Play } from 'lucide-react-native';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { useAuth } from '../../app/hooks/useAuth';
import { API_URL, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';

interface Usuario {
  id: number;
  nick: string;
  idade: number;
  avatar: string;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
  xp: number;
}

const MISSION_LIST = [
  { id: 1, desc: 'Complete 2 lições de Alfabetização', total: 2, reward: 20 },
  { id: 2, desc: 'Ganhe 50 estrelas em Matemática', total: 50, reward: 35 },
  { id: 3, desc: 'Ouça 1 História completa', total: 1, reward: 15 },
  { id: 4, desc: 'Acerte 10 desafios seguidos', total: 10, reward: 25 },
  { id: 5, desc: 'Complete 3 atividades de Escrita', total: 3, reward: 30 },
];

const HISTORIAS_MOCK = [
  { id: 2, titulo: 'Aventuras na Floresta', cor: '#DCFCE7', img: require('../../assets/images/aventuras-floresta.png') },
  { id: 3, titulo: 'O Mistério da Lua', cor: '#DBEAFE', img: require('../../assets/images/misterio-lua.png') },
];

const AVATARES_MAP: Record<string, any> = {
  avatar_1: require('../../assets/images/avatar_1.jpg'),
  avatar_2: require('../../assets/images/avatar_2.jpg'),
  avatar_3: require('../../assets/images/avatar_3.jpg'),
  avatar_4: require('../../assets/images/avatar_4.jpg'),
  avatar_5: require('../../assets/images/avatar_5.jpg'),
};

export default function HomeScreen() {
  const router = useRouter();
  const { nome: paramNome } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { loading } = useAuth();

  // Seleciona a missão baseada no dia do mês para ser a mesma o dia todo
  const dayIndex = new Date().getDate() % MISSION_LIST.length;
  const mission = MISSION_LIST[dayIndex];
  
  // Mock de progresso (em um app real viria do banco)
  const currentProgress = 1; 

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await obterPerfilAtivo();
      if (perfil) {
        setUsuario(perfil);
        try {
          const perfilAtualizado = await buscarUsuarioPorId(perfil.id);
          setUsuario(perfilAtualizado);
          await salvarPerfilAtivo(perfilAtualizado);
        } catch (error) {
          console.error("Erro ao sincronizar perfil na HomeScreen:", error);
        }
      } else {
        router.replace('/selecionar-perfil');
      }
    };

    carregarPerfil();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* TopBar Simplificada e Amigável */}
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            <View style={styles.avatarWrapper}>
              {usuario?.avatar && AVATARES_MAP[usuario.avatar] ? (
                <Image source={AVATARES_MAP[usuario.avatar]} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={20} color="#7C3AED" />
                </View>
              )}
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.welcomeText}>Bem-vindo!</Text>
              <Text style={styles.greeting}>{paramNome || usuario?.nick || 'Visitante'}</Text>
            </View>
          </View>
          
          <View style={styles.topStats}>
            <View style={[styles.statBadge, { backgroundColor: '#FFF7ED' }]}>
              <Flame color="#F97316" size={18} fill="#F97316" />
              <Text style={[styles.statText, { color: '#F97316' }]}>{usuario?.streakAtual || 0}</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: '#FEFCE8' }]}>
              <Coins color="#EAB308" size={18} />
              <Text style={[styles.statText, { color: '#854D0E' }]}>{usuario?.moedas || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerTitle}>Hora de aprender!</Text>
            <Sparkles color="#FBBF24" size={24} />
          </View>
          <Text style={styles.bannerSub}>Continue sua jornada de descobertas</Text>
          <TouchableOpacity style={styles.continueButton}>
            <View style={styles.row}>
              <Play color="#854D0E" size={18} fill="#854D0E" />
              <Text style={styles.continueButtonText}>Continuar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Missão do Dia */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionIconBox}>
              <Target color="#FFF" size={24} />
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>Missão do Dia</Text>
              <Text style={styles.missionDesc}>{mission.desc}</Text>
            </View>
            <View style={styles.missionReward}>
              <Coins color="#EAB308" size={16} />
              <Text style={styles.rewardText}>+{mission.reward}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((usuario?.licoesConcluidas || 0) / mission.total) * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{usuario?.licoesConcluidas || 0} / {mission.total}</Text>
          </View>
        </View>

        {/* Novas Histórias */}
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Novas Histórias</Text>
            <BookOpen color="#7C3AED" size={20} />
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.storiesCarousel}
        >
          {HISTORIAS_MOCK.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyCard}>
              <View style={[styles.storyCover, { backgroundColor: story.cor }]}>
                <Image 
                  source={typeof story.img === 'string' ? { uri: story.img } : story.img} 
                  style={styles.storyImage} 
                  resizeMode="cover"
                />
                <View style={styles.storyBadge}>
                  <Text style={styles.badgeText}>NOVO</Text>
                </View>
              </View>
              <Text style={styles.storyTitle} numberOfLines={1}>{story.titulo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
              style={[styles.card, { borderBottomWidth: 4, borderBottomColor: item.color + '40' }]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                <item.icon size={32} color={item.color} />
              </View>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon size={24} color="#7c3aed" />
          <Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/atividades'); }}>
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
  headerContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'ios' ? 0 : 10
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: { 
    fontSize: 22, 
    fontWeight: '900',
    color: '#1F2937',
    marginTop: -2,
  },
  topStats: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statText: {
    fontSize: 16,
    fontWeight: '800',
  },
  content: { padding: 20 },
  banner: { 
    backgroundColor: '#7C3AED', 
    padding: 24, 
    borderRadius: 24, 
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', marginBottom: 20, fontSize: 16, fontWeight: '600' },
  continueButton: { 
    backgroundColor: '#FBBF24', 
    paddingVertical: 14, 
    paddingHorizontal: 24,
    borderRadius: 18, 
    alignItems: 'center',
    alignSelf: 'flex-start',
    elevation: 4,
  },
  continueButtonText: { fontWeight: '900', color: '#854D0E', fontSize: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
  missionCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  missionIconBox: {
    backgroundColor: '#0EA5E9',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  missionTitle: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  missionDesc: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '700',
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#854D0E',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '700',
  },
  storiesCarousel: {
    paddingLeft: 2,
    paddingRight: 20,
    paddingBottom: 10,
    gap: 15,
  },
  storyCard: {
    width: 130,
  },
  storyCover: {
    width: 130,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 8,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: { 
    width: '45%', 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center', 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: { fontSize: 16, fontWeight: '800', color: '#4B5563' },
  navBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, 
    borderTopWidth: 1, 
    borderColor: '#F3F4F6', 
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  navLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: '700' },
});
