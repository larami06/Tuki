import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    cancelAnimation,
    Easing,
    ZoomIn,
    BounceIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Desafios ────────────────────────────────────────────────────────────────
const CHALLENGES = [
    { id: 1, start: 7, sub: 2, end: 5 },
    { id: 2, start: 9, sub: 3, end: 6 },
    { id: 3, start: 5, sub: 4, end: 1 },
    { id: 4, start: 8, sub: 5, end: 3 },
    { id: 5, start: 10, sub: 3, end: 7 },
];

const NUM_COUNT = 10;
const PAD = 24;
const NODE_WIDTH = (SCREEN_WIDTH - PAD * 2) / NUM_COUNT;

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SubtracaoLunarScreen() {
    const router = useRouter();
    const { completionState, completeGame } = useGameCompletion(32);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [fuel, setFuel] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const challenge = CHALLENGES[currentIndex];

    // ─── Salva progresso ao finalizar ────────────────────────────────────────
    useEffect(() => {
        if (!isFinished) return;
        completeGame(CHALLENGES.length, CHALLENGES.length);
    }, [isFinished]);

    // ─── Back Handler ────────────────────────────────────────────────────────
    useEffect(() => {
        const backAction = () => {
            setShowExitModal(true);
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const handleSuccess = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setShowResult(true);
        setFuel((f) => f + 1);
        playSound('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            setShowResult(false);
            if (currentIndex < CHALLENGES.length - 1) {
                setCurrentIndex((i) => i + 1);
                setIsTransitioning(false);
            } else {
                setIsFinished(true);
            }
        }, 2800);
    }, [currentIndex, isTransitioning]);

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
                <Text style={styles.headerTitle}>Subtração Lunar</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>⛽ {fuel}/{CHALLENGES.length}</Text>
                </View>
            </View>

            {/* Equação */}
            <View style={styles.equationRow}>
                <View style={[styles.eqBox, { borderColor: '#60a5fa' }]}>
                    <Text style={[styles.eqNumber, { color: '#60a5fa' }]}>{challenge.start}</Text>
                </View>
                <Text style={styles.eqOp}>−</Text>
                <View style={[styles.eqBox, { borderColor: '#f87171' }]}>
                    <Text style={[styles.eqNumber, { color: '#f87171' }]}>{challenge.sub}</Text>
                </View>
                <Text style={styles.eqOp}>=</Text>
                <View style={[styles.eqBox, styles.eqResultBox]}>
                    {showResult ? (
                        <Animated.Text entering={ZoomIn} style={styles.eqResultNumber}>
                            {challenge.end}
                        </Animated.Text>
                    ) : (
                        <Text style={styles.eqBlank}>?</Text>
                    )}
                </View>
            </View>

            {/* Dica */}
            <View style={styles.hintBanner}>
                <Text style={styles.hintText}>
                    🚀 Arraste o foguete para o número correto na reta numérica!
                </Text>
            </View>

            {/* Área de jogo */}
            <View style={styles.gameArea}>
                <View style={styles.numberLineContainer}>
                    {/* Linha base */}
                    <View style={styles.lineBase} />

                    {/* Nós numerados */}
                    {Array.from({ length: NUM_COUNT }, (_, i) => {
                        const num = i + 1;
                        const isStart = num === challenge.start;
                        const isTarget = showResult && num === challenge.end;
                        const isActive = isStart || isTarget;
                        return (
                            <View
                                key={num}
                                style={[styles.node, { left: i * NODE_WIDTH + NODE_WIDTH / 2 - 10 }]}
                            >
                                <View style={[styles.nodeTick, isActive && styles.nodeTickActive]} />
                                <Text style={[styles.nodeText, isActive && (isTarget ? styles.nodeTextTarget : styles.nodeTextStart)]}>
                                    {num}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Foguete arrastável */}
                    {!showResult && challenge && (
                        <DraggableRocket
                            key={`rocket-${currentIndex}`}
                            challenge={challenge}
                            onSuccess={handleSuccess}
                            onError={() => {
                                playSound('wrong');
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            }}
                        />
                    )}

                    {/* Foguete no resultado */}
                    {showResult && (
                        <Animated.View
                            entering={BounceIn}
                            style={[
                                styles.rocketStatic,
                                { left: (challenge.end - 1) * NODE_WIDTH + NODE_WIDTH / 2 - 22 },
                            ]}
                        >
                            <Text style={styles.rocketEmoji}>🚀</Text>
                        </Animated.View>
                    )}
                </View>

                {/* Feedback de resultado */}
                {showResult && (
                    <Animated.View entering={BounceIn} style={styles.resultBalloon}>
                        <Text style={styles.resultText}>
                            {challenge.start} − {challenge.sub} = {challenge.end} ✅
                        </Text>
                    </Animated.View>
                )}
            </View>
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

// ─── Foguete Arrastável ──────────────────────────────────────────────────────
function DraggableRocket({
    challenge,
    onSuccess,
    onError,
}: {
    challenge: { start: number; sub: number; end: number };
    onSuccess: () => void;
    onError: () => void;
}) {
    // Centro do nó de início (index = start-1)
    const startLeft = (challenge.start - 1) * NODE_WIDTH + NODE_WIDTH / 2 - 22;

    const x = useSharedValue(startLeft);
    const bob = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        cancelAnimation(bob);
        x.value = withSpring(startLeft);
        bob.value = withRepeat(
            withSequence(
                withTiming(10, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                withTiming(-10, { duration: 700, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        return () => cancelAnimation(bob);
    }, [challenge]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: bob.value },
            { scale: scale.value },
        ],
    }));

    // Import gesture imports
    const { Gesture, GestureDetector, GestureHandlerRootView } = require('react-native-gesture-handler');
    const { runOnJS } = require('react-native-reanimated');

    const drag = Gesture.Pan()
        .onStart(() => {
            cancelAnimation(bob);
            bob.value = 0;
            scale.value = withSpring(1.3);
            runOnJS(playSound)('click');
        })
        .onUpdate((e: any) => {
            x.value = startLeft + e.translationX;
        })
        .onEnd(() => {
            scale.value = withSpring(1);
            // Encontra o nó mais próximo
            const closestIndex = Math.round((x.value + 22 - NODE_WIDTH / 2) / NODE_WIDTH);
            const clamped = Math.max(0, Math.min(NUM_COUNT - 1, closestIndex));
            const droppedNumber = clamped + 1;
            const snappedLeft = clamped * NODE_WIDTH + NODE_WIDTH / 2 - 22;

            if (droppedNumber === challenge.end) {
                x.value = withSpring(snappedLeft);
                runOnJS(onSuccess)();
            } else {
                // Shake e volta
                x.value = withSequence(
                    withTiming(startLeft - 12, { duration: 70 }),
                    withTiming(startLeft + 12, { duration: 70 }),
                    withTiming(startLeft - 8, { duration: 70 }),
                    withSpring(startLeft)
                );
                runOnJS(onError)();
                bob.value = withRepeat(
                    withSequence(
                        withTiming(10, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                        withTiming(-10, { duration: 700, easing: Easing.inOut(Easing.ease) })
                    ),
                    -1,
                    true
                );
            }
        });

    return (
        <GestureHandlerRootView style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <GestureDetector gesture={drag}>
                <Animated.View style={[styles.rocketDraggable, animStyle]}>
                    <Text style={styles.rocketEmoji}>🚀</Text>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },

    header: {
        padding: 18,
        paddingTop: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e1b4b',
        borderBottomWidth: 1,
        borderBottomColor: '#312e81',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
    },
    headerTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    progressText: { color: '#34d399', fontWeight: 'bold', fontSize: 15 },

    // Equação
    equationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    eqBox: {
        width: 56,
        height: 56,
        borderRadius: 14,
        borderWidth: 2.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eqNumber: { fontSize: 26, fontWeight: '900' },
    eqOp: { fontSize: 28, fontWeight: '900', color: '#94a3b8' },
    eqResultBox: { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' },
    eqResultNumber: { fontSize: 28, fontWeight: '900', color: '#fbbf24' },
    eqBlank: { fontSize: 28, fontWeight: '900', color: '#4b5563' },

    // Hint
    hintBanner: {
        marginHorizontal: 20,
        marginTop: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#312e81',
    },
    hintText: {
        color: '#a5b4fc',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Área de jogo
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: PAD,
        gap: 24,
    },

    // Reta numérica
    numberLineContainer: {
        height: 130,
        position: 'relative',
    },
    lineBase: {
        position: 'absolute',
        bottom: 52,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: '#3730a3',
        borderRadius: 3,
    },
    node: {
        position: 'absolute',
        bottom: 36,
        width: 20,
        alignItems: 'center',
    },
    nodeTick: {
        width: 3,
        height: 14,
        backgroundColor: '#4f46e5',
        borderRadius: 2,
        marginBottom: 6,
    },
    nodeTickActive: { backgroundColor: '#fbbf24', height: 20 },
    nodeText: { color: '#6366f1', fontSize: 14, fontWeight: 'bold' },
    nodeTextStart: { color: '#60a5fa', fontSize: 17, fontWeight: '900' },
    nodeTextTarget: { color: '#fbbf24', fontSize: 19, fontWeight: '900' },

    // Foguete arrastável
    rocketDraggable: {
        position: 'absolute',
        bottom: 60,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    rocketStatic: {
        position: 'absolute',
        bottom: 60,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    rocketEmoji: { fontSize: 36 },

    // Balloon de resultado
    resultBalloon: {
        backgroundColor: '#1e2557',
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#6366f1',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    resultText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fbbf24',
        textAlign: 'center',
    },

    // Finished
    finishedSafeArea: { flex: 1, backgroundColor: '#1e1b4b' },
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
    finishedTitle: { fontSize: 32, fontWeight: '900', color: '#34d399', marginBottom: 10 },
    finishedSubtitle: { fontSize: 18, color: '#94a3b8', marginBottom: 36, textAlign: 'center', lineHeight: 26 },
    backButtonLarge: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
