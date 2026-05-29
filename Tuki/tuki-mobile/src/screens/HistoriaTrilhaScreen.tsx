import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Platform, BackHandler
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Star, CheckCircle, XCircle } from 'lucide-react-native';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';
import HISTORIAS from '../data/trilhaHistoriasData';

type Fase = 'lendo' | 'quiz' | 'resultado';

const RECOMPENSA_ESTRELAS = 3;

interface Props {
  idLicao: number;
}

export default function HistoriaTrilhaScreen({ idLicao }: Props) {
  const router = useRouter();
  const { completionState, completeGame } = useGameCompletion(idLicao);
  const config = HISTORIAS[idLicao];

  const [paginaAtual, setPaginaAtual] = useState(0);
  const [fase, setFase] = useState<Fase>('lendo');
  const [respostaIdx, setRespostaIdx] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  if (!config) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#6B7280' }}>História não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#7C3AED', fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const paginas = config.paginas;
  const quiz = config.quiz;
  const pagina = paginas[paginaAtual];
  const isUltima = paginaAtual === paginas.length - 1;
  const acertou = respostaIdx === quiz.correta;
  const bgAtual = fase === 'lendo' ? pagina.bg : '#FAFAFA';

  // ─── Back Handler ────────────────────────────────────────────────────────
  React.useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

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
    playSound(idx === quiz.correta ? 'correct' : 'click');
  };

  const verRecompensa = () => {
    const acertouAgora = respostaIdx === quiz.correta;
    completeGame(acertouAgora ? 3 : 1, 3);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgAtual }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { playSound('click'); setShowExitModal(true); }}>
          <ChevronLeft size={26} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{config.titulo}</Text>
        <View style={styles.estrelas}>
          {Array.from({ length: RECOMPENSA_ESTRELAS }).map((_, i) => (
            <Star key={i} size={16} color="#F59E0B" fill="transparent" />
          ))}
        </View>
      </View>

      {/* Dots */}
      {fase === 'lendo' && (
        <View style={styles.dots}>
          {paginas.map((_, i) => (
            <View key={i} style={[styles.dot, i === paginaAtual && styles.dotAtivo, i < paginaAtual && styles.dotConcluido]} />
          ))}
        </View>
      )}

      {/* ── LENDO ── */}
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
              <ChevronLeft size={22} color={paginaAtual === 0 ? '#D1D5DB' : '#374151'} />
              <Text style={[styles.navBtnText, paginaAtual === 0 && { color: '#D1D5DB' }]}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.paginaLabel}>{paginaAtual + 1} / {paginas.length}</Text>
            <TouchableOpacity style={[styles.navBtn, styles.navBtnAvancar]} onPress={avancar}>
              <Text style={styles.navBtnTextAvancar}>{isUltima ? 'Responder! 🧠' : 'Próxima'}</Text>
              {!isUltima && <ChevronRight size={22} color="#fff" />}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── QUIZ ── */}
      {fase === 'quiz' && (
        <View style={styles.centeredContainer}>
          <View style={styles.quizCard}>
            <Text style={styles.quizEmoji}>🧠</Text>
            <Text style={styles.quizTitulo}>Hora da pergunta!</Text>
            <Text style={styles.quizPergunta}>{quiz.pergunta}</Text>
            <View style={styles.quizOpcoes}>
              {quiz.opcoes.map((opcao, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.opcaoBtn, idx === 0 ? styles.opcaoBtnA : styles.opcaoBtnB]}
                  onPress={() => responder(idx)}
                >
                  <Text style={styles.opcaoBtnLetra}>{idx === 0 ? 'A' : 'B'}</Text>
                  <Text style={styles.opcaoBtnTexto}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ── RESULTADO ── */}
      {fase === 'resultado' && (
        <View style={styles.centeredContainer}>
          <View style={[styles.resultadoCard, acertou ? styles.resultadoAcerto : styles.resultadoErro]}>
            {acertou ? <CheckCircle size={64} color="#16A34A" /> : <XCircle size={64} color="#DC2626" />}
            <Text style={[styles.resultadoTitulo, { color: acertou ? '#16A34A' : '#DC2626' }]}>
              {acertou ? 'Muito bem! 🎉' : 'Quase lá! 😅'}
            </Text>
            <Text style={styles.resultadoTexto}>
              {acertou
                ? 'Você prestou atenção na história!'
                : `A resposta certa era:\n"${quiz.opcoes[quiz.correta]}"`}
            </Text>
            {!acertou && (
              <View style={styles.parcialBadge}>
                <Text style={styles.parcialText}>Você ainda ganha 🪙 +5 por terminar!</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.resultadoBtn, { backgroundColor: acertou ? '#16A34A' : '#7C3AED' }]}
              onPress={verRecompensa}
            >
              <Text style={styles.resultadoBtnText}>Ver recompensa 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {completionState && (
        <GameCompletionModal state={completionState} onContinue={() => router.back()} />
      )}

      <ExitConfirmModal 
        visible={showExitModal} 
        onCancel={() => setShowExitModal(false)} 
        onConfirm={() => { setShowExitModal(false); router.back(); }} 
      />
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
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '900', color: '#1F2937' },
  estrelas: { flexDirection: 'row', gap: 3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.15)' },
  dotAtivo: { backgroundColor: '#EC4899', width: 28 },
  dotConcluido: { backgroundColor: '#22C55E' },
  pageContent: {
    flex: 1, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center', gap: 24,
  },
  emojiBox: {
    width: 150, height: 150, borderRadius: 75,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  emoji: { fontSize: 72 },
  textBox: {
    width: '100%', borderRadius: 24, padding: 24,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  titulo: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginBottom: 12, textAlign: 'center' },
  texto: { fontSize: 17, color: '#374151', lineHeight: 26, textAlign: 'center', fontWeight: '500' },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 12,
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16,
  },
  navBtnVoltar: { backgroundColor: 'rgba(0,0,0,0.06)' },
  navBtnAvancar: { backgroundColor: '#EC4899', elevation: 4 },
  navBtnDesabilitado: { backgroundColor: 'rgba(0,0,0,0.03)' },
  navBtnText: { fontSize: 15, fontWeight: '800', color: '#374151' },
  navBtnTextAvancar: { fontSize: 15, fontWeight: '800', color: '#fff' },
  paginaLabel: { fontSize: 14, fontWeight: '700', color: '#6B7280' },

  centeredContainer: {
    flex: 1, paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    justifyContent: 'center',
  },
  quizCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28,
    alignItems: 'center',
    elevation: 6, shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12,
  },
  quizEmoji: { fontSize: 52, marginBottom: 8 },
  quizTitulo: { fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 12 },
  quizPergunta: {
    fontSize: 17, color: '#374151', textAlign: 'center',
    lineHeight: 26, fontWeight: '600', marginBottom: 24,
  },
  quizOpcoes: { width: '100%', gap: 14 },
  opcaoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18, elevation: 2,
  },
  opcaoBtnA: { backgroundColor: '#FCE7F3' },
  opcaoBtnB: { backgroundColor: '#FEF3C7' },
  opcaoBtnLetra: {
    fontSize: 18, fontWeight: '900', color: '#fff',
    width: 34, height: 34, borderRadius: 17,
    textAlign: 'center', lineHeight: 34,
    backgroundColor: '#EC4899',
  },
  opcaoBtnTexto: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1F2937', lineHeight: 22 },

  resultadoCard: {
    borderRadius: 28, padding: 32, alignItems: 'center', gap: 12,
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  resultadoAcerto: { backgroundColor: '#F0FDF4' },
  resultadoErro: { backgroundColor: '#FFF5F5' },
  resultadoTitulo: { fontSize: 28, fontWeight: '900' },
  resultadoTexto: {
    fontSize: 16, color: '#374151', textAlign: 'center',
    lineHeight: 24, fontWeight: '600',
  },
  parcialBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 14, marginTop: 4,
  },
  parcialText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  resultadoBtn: {
    marginTop: 8, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 18, elevation: 4,
  },
  resultadoBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  recompensaCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  recompensaTitulo: { fontSize: 28, fontWeight: '900', color: '#1F2937', marginBottom: 6 },
  recompensaSub: { fontSize: 15, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  recompensaItens: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  recompensaItem: { alignItems: 'center', gap: 8 },
  recompensaEmoji: { fontSize: 32 },
  recompensaValor: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
  voltarBtn: {
    backgroundColor: '#EC4899', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 18, elevation: 4,
  },
  voltarBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
