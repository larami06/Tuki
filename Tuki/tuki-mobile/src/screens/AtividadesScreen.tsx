import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Book, Home as HomeIcon, ShoppingBag, User, Hash, BookOpen, Sparkles, Target, ChevronRight } from 'lucide-react-native';
import { playSound } from '../services/sound';

// Interface para tipagem dos cards de atividades
interface ActivityCardProps {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  shadowColor3D: string; // Nova propriedade para o efeito de botão 3D infantil
  textColor: string;
  onPress?: () => void;
}

export default function AtividadesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EE" />
      
      {/* DECORAÇÕES DE FUNDO MÁGICAS (Preenchem o espaço vazio nas laterais) */}
      <Text style={[styles.bgStar, { top: 140, left: 15 }]}>⭐</Text>
      <Text style={[styles.bgStar, { top: 320, right: 20, fontSize: 28 }]}>✨</Text>
      <Text style={[styles.bgStar, { bottom: 200, left: 25 }]}>🎈</Text>
      <Text style={[styles.bgStar, { top: 20, left: '40%', fontSize: 16 }]}>🔸</Text>

      {/* BARRA DE STATUS DE RECOMPENSAS (Gamificação no Topo) */}
      <View style={styles.statusBarRewards}>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardIcon}>🔥</Text>
          <Text style={styles.rewardText}>1</Text>
        </View>
        <View style={[styles.rewardBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.rewardIcon}>🪙</Text>
          <Text style={styles.rewardText}>260</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. CABEÇALHO EM CAMADAS */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.headerTitle}>Minhas</Text>
            <Text style={styles.headerTitleBold}>Atividades</Text>
          </View>
          
          <View style={styles.mascotAbsoluteContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Vamos aprender?!</Text>
            </View>
            <Image 
              source={require('../../assets/images/tuki-oi.png')} 
              style={styles.mascotImage} 
              resizeMode="contain" 
            />
          </View>
        </View>

        {/* 2. GRID VERTICAL DE CARDS COM EFEITO 3D COLOQUIAL */}
        <View style={styles.cardsContainer}>
          {/* 1. Alfabetização (A) - Roxo */}
          <ActivityCard 
            title="Alfabetização" 
            icon={<BookOpen size={32} color="#FFFFFF" />}
            backgroundColor="#8B5CF6" 
            shadowColor3D="#6D28D9"
            textColor="#FFFFFF" 
            onPress={() => {
              playSound('click');
              router.push('/trilha-alfabetizacao');
            }}
          />
          {/* 2. Matemática (M) - Verde */}
          <ActivityCard 
            title="Matemática" 
            icon={<Hash size={32} color="#FFFFFF" />}
            backgroundColor="#10B981" 
            shadowColor3D="#047857"
            textColor="#FFFFFF" 
            onPress={() => {
              playSound('click');
              router.push('/trilha-matematica');
            }}
          />

          {/* 3. Histórias (H) - Rosa/Vermelho */}
          <ActivityCard 
            title="Histórias" 
            icon={<Sparkles size={32} color="#FFFFFF" />}
            backgroundColor="#FF5A5F" 
            shadowColor3D="#C92A30"
            textColor="#FFFFFF" 
            onPress={() => {
              playSound('click');
              router.push('/trilha-historias');
            }}
          />

          {/* 4. Desafio do Dia (D) - Amarelo */}
          <ActivityCard 
            title="Desafio do Dia" 
            icon={<Target size={32} color="#1A1C20" />}
            backgroundColor="#FFD166" 
            shadowColor3D="#D4A316"
            textColor="#1A1C20" 
            onPress={() => {
              playSound('click');
            }}
          />
        </View>
        
      </ScrollView>

      {/* 3. BARRA DE NAVEGAÇÃO INFERIOR COESA */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/home'); }}>
          <HomeIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Book size={24} color="#7c3aed" />
          <Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => playSound('click')}>
          <ShoppingBag size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/perfil'); }}>
          <User size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Componente Reutilizável de Card de Atividade com Seta e Efeito 3D
const ActivityCard: React.FC<ActivityCardProps> = ({ title, icon, backgroundColor, shadowColor3D, textColor, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor, borderBottomColor: shadowColor3D }]} 
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        </View>
        {/* Pequeno botão indicador na ponta direita para enriquecer o visual */}
        <View style={styles.cardArrowCircle}>
          <ChevronRight size={20} color={textColor} style={{ opacity: 0.8 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE', 
  },
  bgStar: {
    position: 'absolute',
    fontSize: 22,
    opacity: 0.25, // Sutil para não atrapalhar o texto, mas elimina o "vazio"
    zIndex: 0,
  },
  statusBarRewards: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    zIndex: 20,
  },
  rewardBadge: {
    flexDirection: 'row',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1C20',
  },
  scrollContainer: {
    paddingHorizontal: 24, 
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 120,
    position: 'relative',
  },
  headerTextWrapper: {
    width: '55%', 
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900', 
    color: '#0D3B66',  
  },
  headerTitleBold: {
    fontSize: 38,
    fontWeight: '900', 
    color: '#0D3B66',  
    marginTop: -4,
  },
  mascotAbsoluteContainer: {
    width: '45%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: -10,
    top: -10,
    zIndex: 5,
  },
  mascotImage: {
    width: 130, 
    height: 130, 
  },
  speechBubble: {
    backgroundColor: '#BAE6FD', 
    paddingHorizontal: 14,     
    paddingVertical: 8,       
    borderRadius: 20,          
    position: 'absolute',
    top: 115,
    alignSelf: 'center',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  speechText: {
    fontSize: 13.2,
    fontWeight: 'bold',
    color: '#0369A1', 
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 18,
    marginTop: 10,
  },
  card: {
    borderRadius: 24, 
    paddingHorizontal: 20,
    paddingVertical: 22, 
    // Efeito de Botão de Jogo 3D (Borda de profundidade abaixo)
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18, 
    backgroundColor: 'rgba(255, 255, 255, 0.28)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center', 
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900', // Fonte ligeiramente mais pesada para o público infantil
  },
  cardArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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