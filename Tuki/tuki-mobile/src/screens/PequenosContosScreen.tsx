import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, Easing, FadeIn, ZoomIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STORIES = [
  {
    id: 1,
    intro: "O robô encontrou uma estrela cadente no jardim. Ele ficou muito feliz e decidiu...",
    mascotEmoji: '🤖',
    options: [
      { text: "...levá-la para a lua.", emoji: '🚀', outcome: "A estrela iluminou o caminho do robô até a lua! Que viagem incrível! 🤖✨🚀" },
      { text: "...guardá-la no bolso.", emoji: '👖', outcome: "O robô ficou com um bolso brilhante e quentinho o dia todo! 🤖👖✨" },
      { text: "...dar de presente para a flor.", emoji: '🌻', outcome: "A flor cresceu muito rápido com a energia da estrela! 🤖🌻✨" }
    ]
  },
  {
    id: 2,
    intro: "A girafa queria brincar de esconde-esconde, mas ela era muito alta! Então ela...",
    mascotEmoji: '🦒',
    options: [
      { text: "...se escondeu atrás de um prédio.", emoji: '🏢', outcome: "O prédio era mais alto! A girafa venceu a brincadeira! 🦒🏢🎉" },
      { text: "...vestiu uma fantasia de árvore.", emoji: '🌳', outcome: "Os macacos acharam que ela era uma árvore de verdade! 🦒🌳🐵" }
    ]
  }
];

export default function PequenosContosScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);

  const story = STORIES[currentIndex];

  useEffect(() => {
    if (isFinished) {
      playSound('victory');
      const salvar = async () => {
        try {
          const perfil = await obterPerfilAtivo();
          if (perfil) {
            await registrarProgresso({
              idUsuario: perfil.id,
              idLicao: 6, // ID for Pequenos Contos
              pontuacao: STORIES.length,
              tentativas: 1,
              concluida: true,
            });
            const atualizado = await buscarUsuarioPorId(perfil.id);
            await salvarPerfilAtivo(atualizado);
          }
        } catch (e) {
          console.error(e);
        }
      };
      salvar();
    }
  }, [isFinished]);

  const handleSelect = (option: any) => {
    playSound('correct');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOutcome(option.outcome);
  };

  const handleNext = () => {
    playSound('click');
    setOutcome(null);
    if (currentIndex < STORIES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <SafeAreaView style={styles.finishedSafeArea}>
        <ConfettiEffect />
        <View style={styles.finishedContainer}>
          <Image
            source={require('../../assets/images/happy-tuki.png')}
            style={styles.finishedMascot}
            resizeMode="contain"
          />
          <Text style={styles.finishedTitle}>Fim da História!</Text>
          <Text style={styles.finishedSubtitle}>
            Você criou finais maravilhosos para os contos! 📖✨
          </Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => {
              playSound('click');
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pequenos Contos</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{STORIES.length}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn} key={`intro-${currentIndex}`} style={styles.storyCard}>
          <Text style={styles.mascotEmoji}>{story.mascotEmoji}</Text>
          <Text style={styles.storyIntroText}>{story.intro}</Text>
        </Animated.View>

        {!outcome ? (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.optionsArea}>
            <Text style={styles.chooseText}>Escolha o final:</Text>
            {story.options.map((option, idx) => (
              <TouchableOpacity key={idx} style={styles.optionCard} onPress={() => handleSelect(option)} activeOpacity={0.8}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={ZoomIn} style={styles.outcomeArea}>
            <Text style={styles.outcomeTitle}>O Final:</Text>
            <Text style={styles.outcomeText}>{outcome}</Text>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>
                {currentIndex < STORIES.length - 1 ? 'Próxima História' : 'Terminar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  header: {
    padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f97316', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, elevation: 6
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  progressContainer: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  progressText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  scrollContent: { padding: 24, paddingBottom: 40 },
  
  storyCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
    borderWidth: 2, borderColor: '#fdba74', marginBottom: 24
  },
  mascotEmoji: { fontSize: 72, marginBottom: 16 },
  storyIntroText: { fontSize: 22, color: '#431407', textAlign: 'center', lineHeight: 32, fontWeight: '600' },

  optionsArea: { gap: 16 },
  chooseText: { fontSize: 18, fontWeight: 'bold', color: '#9a3412', textAlign: 'center', marginBottom: 8 },
  optionCard: {
    backgroundColor: '#ffedd5', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#fbd38d', elevation: 2, gap: 16
  },
  optionEmoji: { fontSize: 36 },
  optionText: { flex: 1, fontSize: 18, color: '#7c2d12', fontWeight: 'bold' },

  outcomeArea: {
    backgroundColor: '#f0fdf4', borderRadius: 24, padding: 30, alignItems: 'center',
    borderWidth: 3, borderColor: '#86efac', elevation: 5, marginTop: 10
  },
  outcomeTitle: { fontSize: 20, fontWeight: 'bold', color: '#166534', marginBottom: 16 },
  outcomeText: { fontSize: 24, color: '#14532d', textAlign: 'center', lineHeight: 36, fontWeight: 'bold', marginBottom: 30 },
  
  nextButton: {
    backgroundColor: '#22c55e', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, elevation: 4
  },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  finishedSafeArea: { flex: 1, backgroundColor: '#fff7ed' },
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
  finishedTitle: { fontSize: 38, fontWeight: '900', color: '#f97316', marginBottom: 10, textAlign: 'center' },
  finishedSubtitle: { fontSize: 20, color: '#7c2d12', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
  backButtonLarge: { backgroundColor: '#f97316', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4 },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
