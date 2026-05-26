import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    withSequence, withRepeat, runOnJS, Easing, FadeIn, BounceIn, FadeOut, ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHALLENGES = [
    { id: 1, groupA: 2, groupB: 3, total: 5, colorA: '#60a5fa', colorB: '#facc15' },
    { id: 2, groupA: 1, groupB: 4, total: 5, colorA: '#f472b6', colorB: '#34d399' },
    { id: 3, groupA: 3, groupB: 3, total: 6, colorA: '#a78bfa', colorB: '#fb923c' },
    { id: 4, groupA: 4, groupB: 2, total: 6, colorA: '#38bdf8', colorB: '#f87171' },
];

const NUMBER_WORDS = ["", "Uma...", "Duas...", "Três...", "Quatro...", "Cinco!", "Seis!", "Sete!", "Oito!", "Nove!", "Dez!"];

const PORTAL_SIZE = 150;
const PORTAL_X = SCREEN_WIDTH / 2;
const PORTAL_Y = SCREEN_HEIGHT * 0.48; // um pouco mais para baixo para dar espaço à equação
const DROP_RADIUS = 90;
const STAR_SIZE = 55;

export default function SomaEspacialScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [droppedIds, setDroppedIds] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [lastDroppedCount, setLastDroppedCount] = useState(0);

    const challenge = CHALLENGES[currentIndex];
    const isLevelDone = challenge ? droppedIds.length === challenge.total : false;

    const portalPulse = useSharedValue(1);
    const portalRotate = useSharedValue(0);
    const portalScale = useSharedValue(1);

    // Salvar progresso no banco ao finalizar
    useEffect(() => {
        if (isFinished) {
            playSound('victory');
            const salvar = async () => {
                try {
                    const perfil = await obterPerfilAtivo();
                    if (perfil) {
                        await registrarProgresso({
                            idUsuario: perfil.id,
                            idLicao: 31,
                            pontuacao: CHALLENGES.length,
                            tentativas: 1,
                            concluida: true,
                        });
                        const atualizado = await buscarUsuarioPorId(perfil.id);
                        await salvarPerfilAtivo(atualizado);
                    }
                } catch (e) {
                    console.error('Erro ao registrar progresso de Soma Espacial:', e);
                }
            };
            salvar();
        }
    }, [isFinished]);

    // Animação de pulsação constante do portal
    useEffect(() => {
        portalPulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [currentIndex]);

    // O que acontece quando todas as estrelas entram no portal
    useEffect(() => {
        if (isLevelDone && !showResult && challenge) {
            portalRotate.value = withTiming(360, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
            portalScale.value = withSequence(
                withSpring(1.4),
                withSpring(1.0)
            );
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                setShowResult(true);
            }, 600);

            setTimeout(() => {
                if (currentIndex < CHALLENGES.length - 1) {
                    setDroppedIds([]);
                    setShowResult(false);
                    setLastDroppedCount(0);
                    portalRotate.value = 0;
                    setCurrentIndex(i => i + 1);
                } else {
                    setIsFinished(true);
                }
            }, 3500);
        }
    }, [isLevelDone, showResult, challenge]);

    const handleDrop = (id: string) => {
        setDroppedIds(prev => {
            if (!prev.includes(id)) {
                const newArr = [...prev, id];
                setLastDroppedCount(newArr.length);
                return newArr;
            }
            return prev;
        });
    };

    const portalAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: portalScale.value * portalPulse.value },
            { rotate: `${portalRotate.value}deg` }
        ]
    }));

    if (isFinished) {
        return (
            <SafeAreaView style={styles.finishedSafeArea}>
                <ConfettiEffect />
                <View style={styles.finishedContainer}>
                    <Image source={require('../../assets/images/happy-tuki.png')} style={styles.finishedMascot} resizeMode="contain" />
                    <Text style={styles.finishedTitle}>Missão Cumprida!</Text>
                    <Text style={styles.finishedSubtitle}>Você é um mestre da soma estelar! 🚀🌟</Text>
                    <TouchableOpacity style={styles.backButtonLarge} onPress={() => { playSound('click'); router.back(); }}>
                        <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const buildStars = () => {
        if (!challenge) return [];
        const stars = [];
        for (let i = 0; i < challenge.groupA; i++) {
            stars.push({ id: `A-${currentIndex}-${i}`, group: 'A', color: challenge.colorA });
        }
        for (let i = 0; i < challenge.groupB; i++) {
            stars.push({ id: `B-${currentIndex}-${i}`, group: 'B', color: challenge.colorB });
        }
        return stars;
    };
    const stars = buildStars();

    const renderVisualEquation = () => {
        if (!challenge) return null;
        return (
            <View style={styles.equationRow}>
                <View style={[styles.eqBox, { borderColor: challenge.colorA }]}>
                    {Array.from({ length: challenge.groupA }).map((_, i) => (
                        <Star key={i} size={22} color={challenge.colorA} fill={challenge.colorA} style={styles.eqStar} />
                    ))}
                </View>
                <Text style={styles.eqText}>+</Text>
                <View style={[styles.eqBox, { borderColor: challenge.colorB }]}>
                    {Array.from({ length: challenge.groupB }).map((_, i) => (
                        <Star key={i} size={22} color={challenge.colorB} fill={challenge.colorB} style={styles.eqStar} />
                    ))}
                </View>
                <Text style={styles.eqText}>=</Text>
                <View style={[styles.eqBox, styles.eqResultBox]}>
                    {showResult ? (
                        <Animated.Text entering={ZoomIn} style={styles.eqResultNumber}>
                            {challenge.total}
                        </Animated.Text>
                    ) : (
                        <Text style={styles.eqBlank}>?</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                {showResult && <ConfettiEffect />}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Soma Espacial</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
                    </View>
                </View>

                {renderVisualEquation()}

                <View style={styles.gameArea} pointerEvents="box-none">
                    {/* Portal Mágico */}
                    <View style={styles.portalWrapper} pointerEvents="none">
                        <Animated.View style={[styles.portalOuterRing, portalAnimatedStyle]}>
                            <View style={styles.portalInnerRing}>
                                <View style={styles.portalCore}>
                                    {showResult ? (
                                        <Animated.Text entering={ZoomIn} style={styles.portalResultText}>
                                            {challenge?.total}
                                        </Animated.Text>
                                    ) : (
                                        <Text style={styles.portalHintText}>Arraste aqui!</Text>
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Texto de Contagem Pop-up */}
                    {!showResult && lastDroppedCount > 0 && lastDroppedCount < (challenge?.total || 99) && (
                        <Animated.Text
                            key={lastDroppedCount}
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}
                            style={styles.countingText}
                            pointerEvents="none"
                        >
                            {NUMBER_WORDS[lastDroppedCount]}
                        </Animated.Text>
                    )}

                    {/* Estrelas Flutuantes */}
                    {stars.map((star, index) => {
                        const isDropped = droppedIds.includes(star.id);
                        return (
                            <FloatingStar
                                key={star.id}
                                id={star.id}
                                color={star.color}
                                index={index}
                                isDropped={isDropped}
                                onDrop={handleDrop}
                            />
                        );
                    })}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

function FloatingStar({ id, color, index, isDropped, onDrop }: any) {
    // Espalhando posições: esquerda ou direita dependendo do índice
    const isLeft = index % 2 === 0;
    const padding = 20;
    
    // Gerar alturas pseudo-aleatórias mas espaçadas para não sobrepor muito
    const sideIndex = Math.floor(index / 2);
    const yOffsets = [0.05, 0.65, 0.3, 0.75, 0.45, 0.2];
    const startY = SCREEN_HEIGHT * (yOffsets[sideIndex % yOffsets.length]) + (isLeft ? 0 : 40);

    const sideX = isLeft 
        ? padding + (sideIndex * 15) 
        : SCREEN_WIDTH - padding - STAR_SIZE - (sideIndex * 15);

    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const bob = useSharedValue(0);

    // Efeito de flutuar livremente
    useEffect(() => {
        if (!isDropped) {
            bob.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 1500 + index * 150, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-15, { duration: 1500 + index * 150, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            bob.value = 0;
        }
    }, [isDropped]);

    useEffect(() => {
        if (isDropped) {
            x.value = withSpring(PORTAL_X - sideX - STAR_SIZE / 2);
            y.value = withSpring(PORTAL_Y - startY - STAR_SIZE / 2);
            scale.value = withSequence(withSpring(1.5), withTiming(0, { duration: 300 }));
            opacity.value = withTiming(0, { duration: 350 });
        }
    }, [isDropped]);

    const drag = Gesture.Pan()
        .onStart(() => {
            if (isDropped) return;
            scale.value = withSpring(1.2);
            runOnJS(playSound)('click');
        })
        .onUpdate((e) => {
            if (isDropped) return;
            x.value = e.translationX;
            y.value = e.translationY;
        })
        .onEnd((e) => {
            if (isDropped) return;
            const cx = sideX + STAR_SIZE / 2 + e.translationX;
            const cy = startY + STAR_SIZE / 2 + e.translationY;
            const dist = Math.sqrt(Math.pow(cx - PORTAL_X, 2) + Math.pow(cy - PORTAL_Y, 2));

            if (dist < DROP_RADIUS) {
                runOnJS(onDrop)(id);
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                runOnJS(playSound)('click');
            } else {
                x.value = withSpring(0);
                y.value = withSpring(0);
                scale.value = withSpring(1);
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
        });

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value + bob.value },
            { scale: scale.value }
        ] as any,
        opacity: opacity.value
    }));

    return (
        <GestureDetector gesture={drag}>
            <Animated.View pointerEvents={isDropped ? 'none' : 'auto'} style={[styles.starBubble, animStyle, { left: sideX, top: startY }]}>
                <Star size={STAR_SIZE * 0.75} color={color} fill={color} />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0D17' }, // Fundo de galáxia escuro
    header: { padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
    progressContainer: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    progressText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 16 },
    
    // Equação Visual
    equationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 20, gap: 12, zIndex: 10 },
    eqBox: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', minWidth: 60, minHeight: 60, padding: 8, borderRadius: 16, borderWidth: 2.5, backgroundColor: 'rgba(255,255,255,0.05)' },
    eqStar: { margin: 2 },
    eqText: { fontSize: 32, fontWeight: '900', color: '#94a3b8' },
    eqResultBox: { borderColor: '#fbbf24', minWidth: 65, backgroundColor: 'rgba(251, 191, 36, 0.1)' },
    eqResultNumber: { fontSize: 34, fontWeight: '900', color: '#fbbf24' },
    eqBlank: { fontSize: 32, fontWeight: '900', color: '#4b5563' },

    gameArea: { flex: 1, position: 'relative' },

    // Portal
    portalWrapper: { position: 'absolute', left: PORTAL_X - PORTAL_SIZE / 2, top: PORTAL_Y - PORTAL_SIZE / 2, width: PORTAL_SIZE, height: PORTAL_SIZE, alignItems: 'center', justifyContent: 'center' },
    portalOuterRing: { width: PORTAL_SIZE, height: PORTAL_SIZE, borderRadius: PORTAL_SIZE / 2, backgroundColor: 'rgba(139, 92, 246, 0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(167, 139, 250, 0.4)', borderStyle: 'dashed' },
    portalInnerRing: { width: PORTAL_SIZE * 0.75, height: PORTAL_SIZE * 0.75, borderRadius: (PORTAL_SIZE * 0.75) / 2, backgroundColor: 'rgba(124, 58, 237, 0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#a78bfa' },
    portalCore: { width: PORTAL_SIZE * 0.5, height: PORTAL_SIZE * 0.5, borderRadius: (PORTAL_SIZE * 0.5) / 2, backgroundColor: '#4c1d95', alignItems: 'center', justifyContent: 'center', shadowColor: '#c084fc', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 25, elevation: 15 },
    portalHintText: { color: '#e9d5ff', fontSize: 12, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 4 },
    portalResultText: { color: '#fff', fontSize: 44, fontWeight: '900' },

    // Texto de Contagem
    countingText: { position: 'absolute', top: PORTAL_Y + PORTAL_SIZE / 2 + 30, left: 0, right: 0, textAlign: 'center', fontSize: 36, fontWeight: '900', color: '#fcd34d', textShadowColor: 'rgba(245, 158, 11, 0.8)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10, zIndex: 5 },

    // Estrelas Flutuantes
    starBubble: { position: 'absolute', width: STAR_SIZE, height: STAR_SIZE, borderRadius: STAR_SIZE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', shadowColor: '#fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8, zIndex: 10 },

    // Finalização
    finishedSafeArea: { flex: 1, backgroundColor: '#0B0D17' },
    finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
    finishedTitle: { fontSize: 38, fontWeight: '900', color: '#34d399', marginBottom: 10, textAlign: 'center' },
    finishedSubtitle: { fontSize: 20, color: '#94a3b8', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
    backButtonLarge: { backgroundColor: '#8b5cf6', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});