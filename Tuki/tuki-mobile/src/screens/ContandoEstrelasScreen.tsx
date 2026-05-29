import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ScrollView,
    BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, RefreshCw } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    cancelAnimation,
    Easing,
    FadeIn,
    FadeOut,
    BounceIn,
    ZoomIn,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Exercícios ───────────────────────────────────────────────────────────────
interface Exercise {
    leftCount: number;
    rightCount: number;
    leftColor: string;
    rightColor: string;
    leftEmoji: string;
    rightEmoji: string;
    announcement: string;
}

const EXERCISES: Exercise[] = [
    { leftCount: 2, rightCount: 3, leftColor: '#60a5fa', rightColor: '#fbbf24', leftEmoji: '🔵', rightEmoji: '⭐', announcement: 'Isso! 2 + 3 = 5 estrelas! 🎉' },
    { leftCount: 1, rightCount: 4, leftColor: '#f472b6', rightColor: '#34d399', leftEmoji: '🌸', rightEmoji: '🟢', announcement: 'Incrível! 1 + 4 = 5! ⭐' },
    { leftCount: 3, rightCount: 3, leftColor: '#a78bfa', rightColor: '#fb923c', leftEmoji: '💜', rightEmoji: '🟠', announcement: '3 + 3 = 6! Que demais! 🚀' },
    { leftCount: 2, rightCount: 2, leftColor: '#38bdf8', rightColor: '#f87171', leftEmoji: '💎', rightEmoji: '❤️', announcement: '2 + 2 = 4! Parabéns! ⭐' },
    { leftCount: 4, rightCount: 3, leftColor: '#facc15', rightColor: '#818cf8', leftEmoji: '⭐', rightEmoji: '🔮', announcement: '4 + 3 = 7! Arrasou! 🌟' },
];

const STAR_SIZE = 60;
const GAP = 12;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ContandoEstrelasScreen() {
    const router = useRouter();
    const { completionState, completeGame } = useGameCompletion(30);

    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
    const [showResult, setShowResult] = useState(false);
    const [resultNumber, setResultNumber] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const progressPercent = useSharedValue(0); 
    const blackHolePulse = useSharedValue(1);
    const blackHoleScale = useSharedValue(1);
    const resultScale = useSharedValue(0);

    const exercise = EXERCISES[exerciseIndex];
    const totalStars = exercise.leftCount + exercise.rightCount;
    const collectedCount = collectedIds.size;

    // ─── Back Handler ────────────────────────────────────────────────────────
    useEffect(() => {
        const backAction = () => {
            setShowExitModal(true);
            return true; // prevent default back
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // ─── Pulse animation do buraco negro ─────────────────────────────────────
    useEffect(() => {
        cancelAnimation(blackHolePulse);
        blackHolePulse.value = 1;
        blackHolePulse.value = withRepeat(
            withSequence(
                withTiming(1.07, { duration: 850, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 850, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        return () => cancelAnimation(blackHolePulse);
    }, [exerciseIndex]);

    // ─── Progress bar ─────────────────────────────────────────────────────────
    useEffect(() => {
        progressPercent.value = withSpring((exerciseIndex / EXERCISES.length) * 100, { damping: 14 });
    }, [exerciseIndex]);

    // ─── Verifica se todas as estrelas foram coletadas ────────────────────────
    useEffect(() => {
        if (collectedCount === totalStars && totalStars > 0 && !showResult && !isTransitioning) {
            setIsTransitioning(true);

            blackHoleScale.value = withSequence(withSpring(1.4), withSpring(1.0));
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                setResultNumber(totalStars);
                setShowResult(true);
                resultScale.value = withSpring(1, { damping: 10 });
                setScore((s) => s + 1);
            }, 500);

            setTimeout(() => {
                setShowResult(false);
                resultScale.value = 0;

                if (exerciseIndex < EXERCISES.length - 1) {
                    setExerciseIndex((i) => i + 1);
                    setCollectedIds(new Set());
                    setIsTransitioning(false);
                } else {
                    setIsFinished(true);
                }
            }, 3000);
        }
    }, [collectedCount, totalStars]);

    // ─── Salva progresso ao terminar ──────────────────────────────────────────
    useEffect(() => {
        if (!isFinished) return;
        completeGame(score, EXERCISES.length);
    }, [isFinished]);

    const handleTapStar = useCallback((id: string) => {
        if (isTransitioning) return;
        setCollectedIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        playSound('click');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [isTransitioning]);

    const handleReset = () => {
        playSound('click');
        cancelAnimation(blackHolePulse);
        setExerciseIndex(0);
        setScore(0);
        setCollectedIds(new Set());
        setShowResult(false);
        setIsFinished(false);
        setIsTransitioning(false);
        resultScale.value = 0;
        progressPercent.value = 0;
    };

    const blackHoleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: blackHolePulse.value * blackHoleScale.value }],
    }));

    const progressBarStyle = useAnimatedStyle(() => ({
        width: progressPercent.value + '%' as any,
    }));

    const resultStyle = useAnimatedStyle(() => ({
        transform: [{ scale: resultScale.value }],
        opacity: resultScale.value,
    }));

    // ─── Build stars list ─────────────────────────────────────────────────────
    const buildStars = () => {
        const stars: { id: string; side: 'left' | 'right'; color: string; emoji: string }[] = [];
        for (let i = 0; i < exercise.leftCount; i++) {
            stars.push({ id: `L-${exerciseIndex}-${i}`, side: 'left', color: exercise.leftColor, emoji: exercise.leftEmoji });
        }
        for (let i = 0; i < exercise.rightCount; i++) {
            stars.push({ id: `R-${exerciseIndex}-${i}`, side: 'right', color: exercise.rightColor, emoji: exercise.rightEmoji });
        }
        return stars;
    };
    const stars = buildStars();

    // ─── Jogo principal ───────────────────────────────────────────────────────
    const leftStars = stars.filter((s) => s.side === 'left');
    const rightStars = stars.filter((s) => s.side === 'right');

    return (
        <SafeAreaView style={styles.container}>
            {showResult && <ConfettiEffect />}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { playSound('click'); setShowExitModal(true); }}
                    style={styles.backButton}
                >
                    <ChevronLeft size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contando Estrelas</Text>
                <TouchableOpacity onPress={handleReset} style={styles.resetBadge}>
                    <RefreshCw size={15} color="#fff" />
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

            {/* Equation Row */}
            <View style={styles.equationRow}>
                <View style={[styles.equationBox, { borderColor: exercise.leftColor }]}>
                    <Text style={[styles.equationNumber, { color: exercise.leftColor }]}>
                        {exercise.leftCount}
                    </Text>
                </View>
                <Text style={styles.equationOp}>+</Text>
                <View style={[styles.equationBox, { borderColor: exercise.rightColor }]}>
                    <Text style={[styles.equationNumber, { color: exercise.rightColor }]}>
                        {exercise.rightCount}
                    </Text>
                </View>
                <Text style={styles.equationOp}>=</Text>
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

            {/* Hint text */}
            <Animated.View entering={FadeIn} style={styles.hintBanner}>
                <Text style={styles.hintText}>
                    {isTransitioning
                        ? exercise.announcement
                        : `👆 Toque nas estrelas para jogá-las no Buraco Negro! (${collectedCount}/${totalStars})`}
                </Text>
            </Animated.View>

            {/* Main game area */}
            <View style={styles.gameArea}>
                {/* Coluna esquerda */}
                <View style={styles.sideColumn}>
                    <Text style={[styles.sideLabel, { color: exercise.leftColor }]}>
                        {exercise.leftCount} estrelas
                    </Text>
                    <View style={styles.starsGrid}>
                        {leftStars.map((star) => (
                            <StarTile
                                key={star.id}
                                id={star.id}
                                color={star.color}
                                emoji={star.emoji}
                                isCollected={collectedIds.has(star.id)}
                                onTap={handleTapStar}
                            />
                        ))}
                    </View>
                </View>

                {/* Buraco Negro central */}
                <View style={styles.centerColumn}>
                    <Animated.View style={[styles.blackHoleWrapper, blackHoleStyle]}>
                        <View style={styles.blackHoleRing3} />
                        <View style={styles.blackHoleRing2} />
                        <View style={styles.blackHoleRing1} />
                        <View style={styles.blackHoleCore}>
                            {showResult ? (
                                <Animated.Text entering={ZoomIn} style={styles.blackHoleResultText}>
                                    {resultNumber}
                                </Animated.Text>
                            ) : (
                                <Text style={styles.blackHoleCountText}>
                                    {collectedCount}/{totalStars}
                                </Text>
                            )}
                        </View>
                    </Animated.View>
                    <Text style={styles.blackHoleLabel}>Buraco{'\n'}Negro</Text>
                </View>

                {/* Coluna direita */}
                <View style={styles.sideColumn}>
                    <Text style={[styles.sideLabel, { color: exercise.rightColor }]}>
                        {exercise.rightCount} estrelas
                    </Text>
                    <View style={styles.starsGrid}>
                        {rightStars.map((star) => (
                            <StarTile
                                key={star.id}
                                id={star.id}
                                color={star.color}
                                emoji={star.emoji}
                                isCollected={collectedIds.has(star.id)}
                                onTap={handleTapStar}
                            />
                        ))}
                    </View>
                </View>
            </View>

            {/* Announcement overlay */}
            {showResult && (
                <Animated.View
                    entering={BounceIn}
                    exiting={FadeOut}
                    style={styles.announcementBalloon}
                >
                    <Text style={styles.announcementText}>{exercise.announcement}</Text>
                </Animated.View>
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

// ─── StarTile Component ───────────────────────────────────────────────────────
interface StarTileProps {
    id: string;
    color: string;
    emoji: string;
    isCollected: boolean;
    onTap: (id: string) => void;
}

function StarTile({ id, color, emoji, isCollected, onTap }: StarTileProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (isCollected) {
            scale.value = withSequence(withSpring(1.4), withTiming(0, { duration: 300 }));
            opacity.value = withTiming(0, { duration: 350 });
        } else {
            scale.value = 1;
            opacity.value = 1;
        }
    }, [isCollected]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => !isCollected && onTap(id)}
            disabled={isCollected}
        >
            <Animated.View
                style={[
                    styles.starTile,
                    { backgroundColor: color, shadowColor: color },
                    animStyle,
                ]}
            >
                <Text style={styles.starEmoji}>{emoji}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BH_SIZE = 110;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e2e',
    },

    // Header
    header: {
        paddingHorizontal: 18,
        paddingTop: 36,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12174a',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 6,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
    },
    headerTitle: {
        color: '#e0e7ff',
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    resetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
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
        paddingHorizontal: 20,
        paddingTop: 14,
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 13,
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
        fontSize: 14,
        fontWeight: 'bold',
        color: '#818cf8',
        minWidth: 36,
        textAlign: 'right',
    },

    // Equation
    equationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 20,
    },
    equationBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 2.5,
        backgroundColor: '#12174a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    equationNumber: {
        fontSize: 24,
        fontWeight: '900',
    },
    equationOp: {
        fontSize: 26,
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

    // Hint
    hintBanner: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: '#12174a',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1e2557',
    },
    hintText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Game Area (three columns)
    gameArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
    },
    sideColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    sideLabel: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    starsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: GAP,
    },
    starTile: {
        width: STAR_SIZE,
        height: STAR_SIZE,
        borderRadius: STAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
    },
    starEmoji: {
        fontSize: 28,
    },

    // Center column — Black Hole
    centerColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    blackHoleWrapper: {
        width: BH_SIZE,
        height: BH_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blackHoleRing3: {
        position: 'absolute',
        width: BH_SIZE + 52,
        height: BH_SIZE + 52,
        borderRadius: (BH_SIZE + 52) / 2,
        backgroundColor: 'rgba(99,102,241,0.07)',
    },
    blackHoleRing2: {
        position: 'absolute',
        width: BH_SIZE + 26,
        height: BH_SIZE + 26,
        borderRadius: (BH_SIZE + 26) / 2,
        backgroundColor: 'rgba(99,102,241,0.13)',
    },
    blackHoleRing1: {
        position: 'absolute',
        width: BH_SIZE + 8,
        height: BH_SIZE + 8,
        borderRadius: (BH_SIZE + 8) / 2,
        backgroundColor: 'rgba(99,102,241,0.20)',
        borderWidth: 2,
        borderColor: 'rgba(129,140,248,0.28)',
    },
    blackHoleCore: {
        width: BH_SIZE,
        height: BH_SIZE,
        borderRadius: BH_SIZE / 2,
        backgroundColor: '#000',
        borderWidth: 3,
        borderColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 14,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 20,
    },
    blackHoleCountText: {
        color: '#6366f1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    blackHoleResultText: {
        color: '#fbbf24',
        fontSize: 42,
        fontWeight: '900',
    },
    blackHoleLabel: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Announcement
    announcementBalloon: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        backgroundColor: '#1e2557',
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingVertical: 16,
        borderWidth: 2.5,
        borderColor: '#6366f1',
        elevation: 10,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        alignItems: 'center',
    },
    announcementText: {
        fontSize: 19,
        fontWeight: '900',
        color: '#fbbf24',
        textAlign: 'center',
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
        height: Dimensions.get('window').height * 0.3,
        marginBottom: 16,
    },
    finishedTitle: {
        fontSize: 34,
        fontWeight: '900',
        color: '#10b981',
        marginBottom: 10,
    },
    finishedSubtitle: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 26,
    },
    starsSummaryContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    scoreText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 14,
    },
    starsRewardBadge: {
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
        fontSize: 20,
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
