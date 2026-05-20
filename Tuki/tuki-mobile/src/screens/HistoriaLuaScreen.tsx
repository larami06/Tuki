import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Star, CheckCircle, XCircle } from 'lucide-react-native';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';

const PAGINAS = [
  {
    emoji: '🌙', bg: '#1E1B4B', textoBg: '#312E81',
    titulo: 'A Curiosa Bela',
    texto: 'Toda noite, Bela olhava pela janela do seu quarto e ficava curiosa sobre aquela bolinha brilhante no céu.',
  },
  {
    emoji: '✨', bg: '#1E3A5F', textoBg: '#1E40AF',
    titulo: 'A Grande Pergunta',
    texto: '— Mamãe, por que a lua brilha tanto? Ela é uma lâmpada? — perguntou Bela com os olhinhos arregalados.',
  },
  {
    emoji: '☀️', bg: '#1C3A2E', textoBg: '#166534',
    titulo: 'O Segredo da Lua',
    texto: '— A lua não tem luz própria, meu amor. Ela reflete a luz do sol, como um espelho gigante no céu! — explicou a mamãe.',
  },
  {
    emoji: '🌟', bg: '#3B1F5E', textoBg: '#4C1D95',
    titulo: 'Estrelas Juntas',
    texto: 'Bela ficou maravilhada! Mamãe pegou um cobertor quentinho e as duas foram contar as estrelas juntas na varanda.',
  },
  {
    emoji: '💫', bg: '#1A2744', textoBg: '#1E3A5F',
    titulo: 'Sonhos e Descobertas',
    texto: 'Bela aprendeu que perguntar é o começo de toda descoberta mágica. Ela dormiu sorrindo, sonhando com as estrelas. Fim. 🌙',
  },
];

const QUIZ = {
  pergunta: 'Por que a lua brilha, segundo a mamãe de Bela? 🌙',
  opcoes: [
    'A lua tem uma luzinha própria dentro dela',
    'Ela reflete a luz do sol, como um espelho',
  ],
  correta: 1,
};

const RECOMPENSA_MOEDAS = 15;
const RECOMPENSA_ESTRELAS = 3;
const ID_LICAO = 11;

type Fase = 'lendo' | 'quiz' | 'resultado' | 'recompensa';

export default function HistoriaLuaScreen() {
  const router = useRouter();
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [fase, setFase] = useState<Fase>('lendo');
  const [respostaIdx, setRespostaIdx] = useState<number | null>(null);
  const [mostrarConfete, setMostrarConfete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const pagina = PAGINAS[paginaAtual];
  const isUltima = paginaAtual === PAGINAS.length - 1;
  const acertou = respostaIdx === QUIZ.correta;

  const trocarPagina = (proxima: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setPaginaAtual(proxima);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const avancar = () => {
    playSound('click');
    if (isUltima) setFase('quiz');
    else trocarPagina(paginaAtual + 1);
  };

  const voltar = () => {
    if (paginaAtual > 0) { playSound('click'); trocarPagina(paginaAtual - 1); }
  };

  const responder = (idx: number) => {
    setRespostaIdx(idx);
    setFase('resultado');
    playSound(idx === QUIZ.correta ? 'victory' : 'click');
  };

  const verRecompensa = async () => {
    setFase('recompensa');
    if (acertou) setMostrarConfete(true);
    try {
      const perfil = await obterPerfilAtivo();
      if (perfil) {
        await registrarProgresso({
          idUsuario: perfil.id,
          idLicao: ID_LICAO,
          pontuacao: acertou ? 3 : 1,
          tentativas: 1,
          concluida: true,
        });
        const perfilAtualizado = await buscarUsuarioPorId(perfil.id);
        await salvarPerfilAtivo(perfilAtualizado);
      }
    } catch (e) {
      console.error('Erro ao registrar progresso:', e);
    }
  };

  const bgAtual = fase === 'lendo' ? pagina.bg : '#0F172A';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgAtual }]}>
      {mostrarConfete && <ConfettiEffect />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>O Mistério da Lua</Text>
        <View style={styles.estrelas}>
          {Array.from({ length: RECOMPENSA_ESTRELAS }).map((_, i) => (
            <Star key={i} size={16} color="#F59E0B" fill={fase === 'recompensa' && acertou ? '#F59E0B' : 'transparent'} />
          ))}
        </View>
      </View>

      {/* Dots (só na leitura) */}
      {fase === 'lendo' && (
        <View style={styles.dots}>
          {PAGINAS.map((_, i) => (
            <View key={i} style={[styles.dot, i === paginaAtual && styles.dotAtivo, i < paginaAtual && styles.dotConcluido]} />
          ))}
        </View>
      )}

      {/* ── FASE: LENDO ── */}
      {fase === 'lendo' && (
        <>
          <Animated.View style={[styles.pageContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.emojiBox, { backgroundColor: pagina.textoBg }]}>
              <Text style={styles.emoji}>{pagina.emoji}</Text>
            </View>
            <View style={[styles.textBox, { backgroundColor: pagina.textoBg }]}>
              <Text style={styles.titulo}>{pagina.titulo}</Text>
              <Text style={styles.texto}>{pagina.texto}</Text>
            </View>
          </Animated.View>

          <View style={styles.nav}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnVoltar, paginaAtual === 0 && styles.navBtnDesabilitado]}
              onPress={voltar} disabled={paginaAtual === 0}
            >
              <ChevronLeft size={22} color={paginaAtual === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)'} />
              <Text style={[styles.navBtnText, paginaAtual === 0 && { color: 'rgba(255,255,255,0.3)' }]}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.paginaLabel}>{paginaAtual + 1} / {PAGINAS.length}</Text>
            <TouchableOpacity style={[styles.navBtn, styles.navBtnAvancar]} onPress={avancar}>
              <Text style={styles.navBtnTextAvancar}>{isUltima ? 'Responder! 🧠' : 'Próxima'}</Text>
              {!isUltima && <ChevronRight size={22} color="#1E1B4B" />}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── FASE: QUIZ ── */}
      {fase === 'quiz' && (
        <View style={styles.quizContainer}>
          <View style={styles.quizCard}>
            <Text style={styles.quizEmoji}>🧠</Text>
            <Text style={styles.quizTitulo}>Hora da pergunta!</Text>
            <Text style={styles.quizPergunta}>{QUIZ.pergunta}</Text>
            <View style={styles.quizOpcoes}>
              {QUIZ.opcoes.map((opcao, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.opcaoBtn, idx === 0 ? styles.opcaoBtnA : styles.opcaoBtnB]}
                  onPress={() => responder(idx)}
                >
                  <Text style={[styles.opcaoBtnLetra, { backgroundColor: idx === 0 ? '#312E81' : '#1E40AF' }]}>
                    {idx === 0 ? 'A' : 'B'}
                  </Text>
                  <Text style={styles.opcaoBtnTexto}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ── FASE: RESULTADO ── */}
      {fase === 'resultado' && (
        <View style={styles.quizContainer}>
          <View style={[styles.resultadoCard, acertou ? styles.resultadoAcerto : styles.resultadoErro]}>
            {acertou
              ? <CheckCircle size={64} color="#4ADE80" />
              : <XCircle size={64} color="#F87171" />
            }
            <Text style={[styles.resultadoTitulo, { color: acertou ? '#4ADE80' : '#F87171' }]}>
              {acertou ? 'Muito bem! 🎉' : 'Quase lá! 😅'}
            </Text>
            <Text style={styles.resultadoTexto}>
              {acertou
                ? 'Você prestou atenção na história! Incrível!'
                : `A resposta certa era:\n"${QUIZ.opcoes[QUIZ.correta]}"`
              }
            </Text>
            {!acertou && (
              <View style={styles.recompensaParcialBadge}>
                <Text style={styles.recompensaParcialText}>Você ainda ganha 🪙 +5 por terminar!</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.resultadoBtn, { backgroundColor: acertou ? '#4ADE80' : '#6366F1' }]}
              onPress={verRecompensa}
            >
              <Text style={[styles.resultadoBtnText, { color: acertou ? '#1A2744' : '#fff' }]}>Ver recompensa 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── FASE: RECOMPENSA ── */}
      {fase === 'recompensa' && (
        <View style={styles.quizContainer}>
          <View style={styles.recompensaBox}>
            <Text style={styles.recompensaTitulo}>{acertou ? 'Parabéns! 🎉' : 'Boa leitura! 📖'}</Text>
            <Text style={styles.recompensaSub}>
              {acertou ? 'Você terminou e acertou a pergunta!' : 'Você terminou a história!'}
            </Text>
            <View style={styles.recompensaItens}>
              <View style={styles.recompensaItem}>
                <Text style={styles.recompensaEmoji}>🪙</Text>
                <Text style={styles.recompensaValor}>+{acertou ? RECOMPENSA_MOEDAS : 5}</Text>
              </View>
              {acertou && (
                <View style={styles.recompensaItem}>
                  <Star size={28} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.recompensaValor}>+{RECOMPENSA_ESTRELAS}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.voltarBtn} onPress={() => router.back()}>
              <Text style={styles.voltarBtnText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 12, gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
  estrelas: { flexDirection: 'row', gap: 3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotAtivo: { backgroundColor: '#F59E0B', width: 28 },
  dotConcluido: { backgroundColor: '#4ADE80' },
  pageContent: {
    flex: 1, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center', gap: 24,
  },
  emojiBox: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  emoji: { fontSize: 80 },
  textBox: {
    width: '100%', borderRadius: 24, padding: 24,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  titulo: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  texto: { fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 28, textAlign: 'center', fontWeight: '500' },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 12,
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16,
  },
  navBtnVoltar: { backgroundColor: 'rgba(255,255,255,0.1)' },
  navBtnAvancar: { backgroundColor: '#F59E0B', elevation: 4 },
  navBtnDesabilitado: { backgroundColor: 'rgba(255,255,255,0.05)' },
  navBtnText: { fontSize: 15, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  navBtnTextAvancar: { fontSize: 15, fontWeight: '800', color: '#1E1B4B' },
  paginaLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },

  quizContainer: {
    flex: 1, paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    justifyContent: 'center',
  },
  quizCard: {
    backgroundColor: '#1E293B', borderRadius: 28, padding: 28,
    alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  quizEmoji: { fontSize: 52, marginBottom: 8 },
  quizTitulo: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 12 },
  quizPergunta: {
    fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center',
    lineHeight: 26, fontWeight: '600', marginBottom: 24,
  },
  quizOpcoes: { width: '100%', gap: 14 },
  opcaoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18,
  },
  opcaoBtnA: { backgroundColor: '#1E1B4B' },
  opcaoBtnB: { backgroundColor: '#1E3A5F' },
  opcaoBtnLetra: {
    fontSize: 20, fontWeight: '900', color: '#fff',
    width: 36, height: 36, borderRadius: 18,
    textAlign: 'center', lineHeight: 36,
  },
  opcaoBtnTexto: { flex: 1, fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.9)', lineHeight: 22 },

  resultadoCard: {
    borderRadius: 28, padding: 32,
    alignItems: 'center', gap: 12,
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  resultadoAcerto: { backgroundColor: '#052E16' },
  resultadoErro: { backgroundColor: '#1C0A0A' },
  resultadoTitulo: { fontSize: 28, fontWeight: '900' },
  resultadoTexto: {
    fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center',
    lineHeight: 24, fontWeight: '600',
  },
  recompensaParcialBadge: {
    backgroundColor: 'rgba(253,224,71,0.15)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 14, marginTop: 4,
    borderWidth: 1, borderColor: 'rgba(253,224,71,0.3)',
  },
  recompensaParcialText: { fontSize: 13, fontWeight: '700', color: '#FDE047' },
  resultadoBtn: {
    marginTop: 8, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 18, elevation: 4,
  },
  resultadoBtnText: { fontWeight: '900', fontSize: 16 },

  recompensaBox: {
    backgroundColor: '#1E293B', borderRadius: 28, padding: 32,
    alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  recompensaTitulo: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 6 },
  recompensaSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24, textAlign: 'center' },
  recompensaItens: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  recompensaItem: { alignItems: 'center', gap: 8 },
  recompensaEmoji: { fontSize: 32 },
  recompensaValor: { fontSize: 22, fontWeight: '900', color: '#fff' },
  voltarBtn: {
    backgroundColor: '#F59E0B', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 18, elevation: 4,
  },
  voltarBtnText: { color: '#1E1B4B', fontWeight: '900', fontSize: 16 },
});
