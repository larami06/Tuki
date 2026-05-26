import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    runOnJS,
    Easing,
    FadeIn,
    FadeOut,
    BounceIn,
    ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Exercícios de soma ──────────────────────────────────────────────────────
interface Exercise {
    leftCount: number;
    rightCount: number;
    leftColor: string;
    rightColor: string;
    announcement: string;
}

const EXERCISES: Exercise[] = [
    { leftCount: 2, rightCount: 3, leftColor: '#60a5fa', rightColor: '#fbbf24', announcement: 'Isso! Cinco estrelas! ⭐' },
    { leftCount: 1, rightCount: 4, leftColor: '#f472b6', rightColor: '#34d399', announcement: 'Incrível! Cinco estrelas! ⭐' },
    { leftCount: 3, rightCount: 3, leftColor: '#a78bfa', rightColor: '#fb923c', announcement: 'Seis estrelas! Que demais! ⭐' },
    { leftCount: 2, rightCount: 2, leftColor: '#38bdf8', rightColor: '#f87171', announcement: 'Quatro estrelas! Parabéns! ⭐' },
    { leftCount: 4, rightCount: 3, leftColor: '#facc15', rightColor: '#818cf8', announcement: 'Sete estrelas! Arrasou! ⭐' },
];

// ─── Layout constants ────────────────────────────────────────────────────────
const BLACK_HOLE_SIZE = 130;
const BLACK_HOLE_CENTER_X = SCREEN_WIDTH / 2;
const BLACK_HOLE_CENTER_Y = SCREEN_HEIGHT * 0.42;
const DROP_RADIUS = 72;

const STAR_SIZE = 52;

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ContandoEstrelasScreen() {
    const router = useRouter();

    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [droppedIds, setDroppedIds] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [resultNumber, setResultNumber] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const progressPercent = useSharedValue(0);
    const blackHoleScale = useSharedValue(1);
    const blackHolePulse = useSharedValue(1);
    const resultScale = useSharedValue(0);

    const exercise = EXERCISES[exerciseIndex];
    const totalStars = exercise.leftCount + exercise.rightCount;
    const droppedCount = droppedIds.length;

    // Pulse animation for black hole
    useEffect(() => {
        blackHolePulse.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [exerciseIndex]);

    // Update progress bar
    useEffect(() => {
        progressPercent.value = withSpring((exerciseIndex / EXERCISES.length) * 100, { damping: 15 });
    }, [exerciseIndex]);

    // Check if all stars dropped
    useEffect(() => {
        if (droppedCount === totalStars && totalStars > 0 && !showResult && !isTransitioning) {
            setIsTransitioning(true);
            // Burst effect on black hole
            blackHoleScale.value = withSequence(withSpring(1.35), withSpring(1.0));
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                setResultNumber(totalStars);
                setShowResult(true);
                resultScale.value = withSpring(1, { damping: 10 });
                setScore((s) => s + 1);
            }, 600);

            setTimeout(() => {
                setShowResult(false);
                resultScale.value = 0;
                if (exerciseIndex < EXERCISES.length - 1) {
                    setExerciseIndex((i) => i + 1);
                    setDroppedIds([]);
                    setIsTransitioning(false);
                } else {
                    setIsFinished(true);
                }
            }, 3200);
        }
    }, [droppedCount, totalStars]);

    // Save progress on finish
    useEffect(() => {
        if (isFinished) {
            playSound('victory');
            const salvar = async () => {
                try {
                    const perfil = await obterPerfilAtivo();
                    if (perfil) {
                        await registrarProgresso({
                            idUsuario: perfil.id,
                            idLicao: 30, // Contando Estrelas – trilha-matematica
                            pontuacao: score,
                            tentativas: 1,
                            concluida: true,
                        });
                        const atualizado = await buscarUsuarioPorId(perfil.id);
                        await salvarPerfilAtivo(atualizado);
                    }
                } catch (e) {
                    console.error('Erro ao registrar progresso de Contando Estrelas:', e);
                }
            };
            salvar();
        }
    }, [isFinished]);

    const handleDropStar = (id: string) => {
        setDroppedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const handleReset = () => {
        playSound('click');
        setExerciseIndex(0);
        setScore(0);
        setDroppedIds([]);
        setShowResult(false);
        setIsFinished(false);
        setIsTransitioning(false);
        resultScale.value = 0;
        progressPercent.value = 0;
    };

    const blackHoleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: blackHoleScale.value * blackHolePulse.value }],
    }));

    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${progressPercent.value}%`,
    }));

    const resultStyle = useAnimatedStyle(() => ({
        transform: [{ scale: resultScale.value }],
        opacity: resultScale.value,
    }));

    // ─── Stars for this exercise ─────────────────────────────────────────────
    const buildStars = () => {
        const stars: { id: string; side: 'left' | 'right'; color: string }[] = [];
        for (let i = 0; i < exercise.leftCount; i++) {
            stars.push({ id: `L-${exerciseIndex}-${i}`, side: 'left', color: exercise.leftColor });
        }
        for (let i = 0; i < exercise.rightCount; i++) {
            stars.push({ id: `R-${exerciseIndex}-${i}`, side: 'right', color: exercise.rightColor });
        }
        return stars;
    };

    const stars = buildStars();

    // ─── Finished Screen ─────────────────────────────────────────────────────
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
                    <Text style={styles.finishedTitle}>Incrível!</Text>
                    <Text style={styles.finishedSubtitle}>
                        Você ajudou o Tuki a contar todas as estrelas do espaço! 🚀🌟
                    </Text>

                    <View style={styles.starsSummaryContainer}>
                        <Text style={styles.scoreText}>Pontuação: {score} de {EXERCISES.length}</Text>
                        <View style={styles.starsRewardBadge}>
                            <Text style={styles.starsRewardText}>⭐ +40 Estrelas obtidas!</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.backButtonLarge}
                        onPress={() => { playSound('click'); router.back(); }}
                    >
                        <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ─── Main Game ────────────────────────────────────────────────────────────
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                {showResult && <ConfettiEffect />}

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => { playSound('click'); router.back(); }}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contando Estrelas</Text>
                    <TouchableOpacity onPress={handleReset} style={styles.resetBadge}>
                        <Sparkles size={16} color="#fff" />
                        <Text style={styles.resetBadgeText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressArea}>
                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
                    </View>
                    <Text style={styles.progressText}>{exerciseIndex}/{EXERCISES.length}</Text>
                </View>

                {/* Equation display */}
                <View style={styles.equationRow}>
                    <View style={[styles.equationBox, { borderColor: exercise.leftColor }]}>
                        <Text style={[styles.equationNumber, { color: exercise.leftColor }]}>
                            {exercise.leftCount}
                        </Text>
                    </View>
                    <Text style={styles.equationPlus}>+</Text>
                    <View style={[styles.equationBox, { borderColor: exercise.rightColor }]}>
                        <Text style={[styles.equationNumber, { color: exercise.rightColor }]}>
                            {exercise.rightCount}
                        </Text>
                    </View>
                    <Text style={styles.equationEquals}>=</Text>
                    <View style={[styles.equationBox, styles.equationResultBox]}>
                        {showResult ? (
                            <Animated.Text style={[styles.equationNumber, styles.equationResultNumber, resultStyle]}>
                                {resultNumber}
                            </Animated.Text>
                        ) : (
                            <Text style={styles.equationBlank}>?</Text>
                        )}
                    </View>
                </View>

                {/* Game area */}
                <View style={styles.gameArea} pointerEvents="box-none">
                    {/* Black Hole */}
                    <Animated.View
                        style={[styles.blackHoleWrapper, blackHoleAnimatedStyle]}
                        pointerEvents="none"
                    >
                        {/* Outer glow rings */}
                        <View style={styles.blackHoleRing3} />
                        <View style={styles.blackHoleRing2} />
                        <View style={styles.blackHoleRing1} />
                        <View style={styles.blackHoleCore}>
                            {showResult ? (
                                <Animated.Text entering={ZoomIn} style={styles.blackHoleResultText}>
                                    {resultNumber}
                                </Animated.Text>
                            ) : (
                                <Text style={styles.blackHoleHintText}>
                                    {droppedCount}/{totalStars}
                                </Text>
                            )}
                        </View>
                    </Animated.View>

                    {/* Draggable stars */}
                    {stars.map((star, index) => {
                        const isDropped = droppedIds.includes(star.id);
                        return (
                            <StarBubble
                                key={star.id}
                                id={star.id}
                                side={star.side}
                                color={star.color}
                                index={index}
                                sideIndex={
                                    star.side === 'left'
                                        ? stars.filter((s) => s.side === 'left').indexOf(star)
                                        : stars.filter((s) => s.side === 'right').indexOf(star)
                                }
                                sideTotal={
                                    star.side === 'left' ? exercise.leftCount : exercise.rightCount
                                }
                                isDropped={isDropped}
                                onDropSuccess={handleDropStar}
                            />
                        );
                    })}

                    {/* Announcement balloon */}
                    {showResult && (
                        <Animated.View
                            entering={BounceIn}
                            exiting={FadeOut}
                            style={styles.announcementBalloon}
                        >
                            <Text style={styles.announcementText}>{exercise.announcement}</Text>
                        </Animated.View>
                    )}
                </View>

                {/* Mascot hint */}
                {!showResult && (
                    <Animated.View entering={FadeIn} style={styles.mascotBalloon}>
                        <Text style={styles.mascotText}>
                            🚀 Arraste todas as estrelas para o Buraco Negro Mágico!
                        </Text>
                    </Animated.View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

// ─── Draggable Star Component ─────────────────────────────────────────────────
interface StarBubbleProps {
    id: string;
    side: 'left' | 'right';
    color: string;
    index: number;
    sideIndex: number;
    sideTotal: number;
    isDropped: boolean;
    onDropSuccess: (id: string) => void;
}

function StarBubble({
    id,
    side,
    color,
    sideIndex,
    sideTotal,
    isDropped,
    onDropSuccess,
}: StarBubbleProps) {
    // Calculate starting position
    const sideX = side === 'left' ? SCREEN_WIDTH * 0.1 : SCREEN_WIDTH * 0.72;
    const totalHeight = sideTotal * (STAR_SIZE + 18);
    const startY = BLACK_HOLE_CENTER_Y - totalHeight / 2 + sideIndex * (STAR_SIZE + 18);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Bob animation
    const bob = useSharedValue(0);

    useEffect(() => {
        if (!isDropped) {
            bob.value = withRepeat(
                withSequence(
                    withTiming(10, { duration: 1400 + sideIndex * 180, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-10, { duration: 1400 + sideIndex * 180, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            bob.value = 0;
        }
    }, [isDropped]);

    // Snap-to-center when dropped
    useEffect(() => {
        if (isDropped) {
            translateX.value = withSpring(BLACK_HOLE_CENTER_X - sideX - STAR_SIZE / 2);
            translateY.value = withSpring(BLACK_HOLE_CENTER_Y - startY - STAR_SIZE / 2);
            scale.value = withSequence(withSpring(1.4), withTiming(0, { duration: 350 }));
            opacity.value = withTiming(0, { duration: 400 });
        }
    }, [isDropped]);

    const dragGesture = Gesture.Pan()
        .onStart(() => {
            if (isDropped) return;
            scale.value = withSpring(1.3);
            runOnJS(playSound)('click');
        })
        .onUpdate((e) => {
            if (isDropped) return;
            translateX.value = e.translationX;
            translateY.value = e.translationY;
        })
        .onEnd((e) => {
            if (isDropped) return;

            const cx = sideX + STAR_SIZE / 2 + e.translationX;
            const cy = startY + STAR_SIZE / 2 + e.translationY;
            const dist = Math.sqrt(
                Math.pow(cx - BLACK_HOLE_CENTER_X, 2) + Math.pow(cy - BLACK_HOLE_CENTER_Y, 2)
            );

            if (dist < DROP_RADIUS) {
                runOnJS(onDropSuccess)(id);
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
        });

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value + bob.value },
            { scale: scale.value },
        ] as any,
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={dragGesture}>
            <Animated.View
                pointerEvents={isDropped ? 'none' : 'auto'}
                style={[
                    styles.starBubble,
                    animStyle,
                    {
                        left: sideX,
                        top: startY,
                        backgroundColor: color,
                        shadowColor: color,
                    },
                ]}
            >
                <Text style={styles.starEmoji}>⭐</Text>
            </Animated.View>
        </GestureDetector>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e2e',
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12174a',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 6,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
    },
    headerTitle: {
        color: '#e0e7ff',
        fontSize: 21,
        fontWeight: 'bold',
        letterSpacing: 0.4,
    },
    resetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    resetBadgeText: {
        color: '#e0e7ff',
        fontSize: 13,
        fontWeight: 'bold',
    },

    // Progress
    progressArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingTop: 14,
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 14,
        backgroundColor: '#1e2557',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2e3580',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#818cf8',
    },
    progressText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#818cf8',
    },

    // Equation
    equationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 18,
        marginBottom: 4,
        paddingHorizontal: 24,
    },
    equationBox: {
        width: 54,
        height: 54,
        borderRadius: 14,
        borderWidth: 2.5,
        backgroundColor: '#12174a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    equationNumber: {
        fontSize: 26,
        fontWeight: '900',
    },
    equationPlus: {
        fontSize: 28,
        fontWeight: '900',
        color: '#94a3b8',
    },
    equationEquals: {
        fontSize: 28,
        fontWeight: '900',
        color: '#94a3b8',
    },
    equationResultBox: {
        borderColor: '#fbbf24',
        backgroundColor: '#1e1a00',
    },
    equationResultNumber: {
        color: '#fbbf24',
    },
    equationBlank: {
        fontSize: 26,
        fontWeight: '900',
        color: '#4b5563',
    },

    // Game Area
    gameArea: {
        flex: 1,
        position: 'relative',
    },

    // Black Hole
    blackHoleWrapper: {
        position: 'absolute',
        left: BLACK_HOLE_CENTER_X - BLACK_HOLE_SIZE / 2,
        top: BLACK_HOLE_CENTER_Y - BLACK_HOLE_SIZE / 2,
        width: BLACK_HOLE_SIZE,
        height: BLACK_HOLE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blackHoleRing3: {
        position: 'absolute',
        width: BLACK_HOLE_SIZE + 60,
        height: BLACK_HOLE_SIZE + 60,
        borderRadius: (BLACK_HOLE_SIZE + 60) / 2,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
    },
    blackHoleRing2: {
        position: 'absolute',
        width: BLACK_HOLE_SIZE + 30,
        height: BLACK_HOLE_SIZE + 30,
        borderRadius: (BLACK_HOLE_SIZE + 30) / 2,
        backgroundColor: 'rgba(99, 102, 241, 0.14)',
    },
    blackHoleRing1: {
        position: 'absolute',
        width: BLACK_HOLE_SIZE + 10,
        height: BLACK_HOLE_SIZE + 10,
        borderRadius: (BLACK_HOLE_SIZE + 10) / 2,
        backgroundColor: 'rgba(99, 102, 241, 0.22)',
        borderWidth: 2,
        borderColor: 'rgba(129, 140, 248, 0.3)',
    },
    blackHoleCore: {
        width: BLACK_HOLE_SIZE,
        height: BLACK_HOLE_SIZE,
        borderRadius: BLACK_HOLE_SIZE / 2,
        backgroundColor: '#000',
        borderWidth: 3,
        borderColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 18,
    },
    blackHoleHintText: {
        color: '#6366f1',
        fontSize: 20,
        fontWeight: 'bold',
    },
    blackHoleResultText: {
        color: '#fbbf24',
        fontSize: 46,
        fontWeight: '900',
    },

    // Stars
    starBubble: {
        position: 'absolute',
        width: STAR_SIZE,
        height: STAR_SIZE,
        borderRadius: STAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        zIndex: 10,
    },
    starEmoji: {
        fontSize: 28,
    },

    // Announcement balloon
    announcementBalloon: {
        position: 'absolute',
        bottom: 30,
        left: 24,
        right: 24,
        backgroundColor: '#1e2557',
        borderRadius: 22,
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderWidth: 2.5,
        borderColor: '#6366f1',
        elevation: 8,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        alignItems: 'center',
    },
    announcementText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fbbf24',
        textAlign: 'center',
    },

    // Mascot
    mascotBalloon: {
        marginHorizontal: 22,
        marginBottom: 22,
        backgroundColor: '#12174a',
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderWidth: 2,
        borderColor: '#1e2557',
        elevation: 2,
    },
    mascotText: {
        color: '#94a3b8',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Finished screen
    finishedSafeArea: {
        flex: 1,
        backgroundColor: '#f0f9ff',
    },
    finishedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    finishedMascot: {
        width: '70%',
        height: Dimensions.get('window').height * 0.32,
        marginBottom: 20,
    },
    finishedTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#10b981',
        marginBottom: 10,
    },
    finishedSubtitle: {
        fontSize: 20,
        color: '#64748b',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 28,
    },
    starsSummaryContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 15,
    },
    starsRewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        borderColor: '#fef3c7',
        borderWidth: 2,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    starsRewardText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#d97706',
    },
    backButtonLarge: {
        backgroundColor: '#10b981',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
