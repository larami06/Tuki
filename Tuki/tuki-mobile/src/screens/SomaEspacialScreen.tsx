import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
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
    BounceIn,
    FadeOut,
    ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Desafios ────────────────────────────────────────────────────────────────
interface Challenge {
    id: number;
    groupA: number;
    groupB: number;
    total: number;
    colorA: string;
    colorB: string;
    emojiA: string;
    emojiB: string;
}

const CHALLENGES: Challenge[] = [
    { id: 1, groupA: 2, groupB: 3, total: 5, colorA: '#60a5fa', colorB: '#facc15', emojiA: '🔵', emojiB: '⭐' },
    { id: 2, groupA: 1, groupB: 4, total: 5, colorA: '#f472b6', colorB: '#34d399', emojiA: '🌸', emojiB: '🟢' },
    { id: 3, groupA: 3, groupB: 3, total: 6, colorA: '#a78bfa', colorB: '#fb923c', emojiA: '💜', emojiB: '🟠' },
    { id: 4, groupA: 4, groupB: 2, total: 6, colorA: '#38bdf8', colorB: '#f87171', emojiA: '💎', emojiB: '❤️' },
];

const STAR_SIZE = 58;
const GAP = 10;

// ─── Tela Principal ──────────────────────────────────────────────────────────
export default function SomaEspacialScreen() {
    const router = useRouter();
    const { completionState, completeGame } = useGameCompletion(31);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const challenge = CHALLENGES[currentIndex];
    const totalStars = challenge.groupA + challenge.groupB;
    const collectedCount = collectedIds.size;

    const portalPulse = useSharedValue(1);
    const portalScale = useSharedValue(1);
    const portalRotate = useSharedValue(0);
    const resultScale = useSharedValue(0);

    // ─── Animação do portal ──────────────────────────────────────────────────
    useEffect(() => {
        cancelAnimation(portalPulse);
        portalPulse.value = 1;
        portalPulse.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        return () => cancelAnimation(portalPulse);
    }, [currentIndex]);

    // ─── Verifica se todas as estrelas foram coletadas ───────────────────────
    useEffect(() => {
        if (collectedCount === totalStars && totalStars > 0 && !showResult && !isTransitioning) {
            setIsTransitioning(true);

            portalScale.value = withSequence(withSpring(1.4), withSpring(1.0));
            portalRotate.value = withTiming(360, { duration: 900, easing: Easing.out(Easing.cubic) });
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                setShowResult(true);
                resultScale.value = withSpring(1, { damping: 10 });
            }, 500);

            setTimeout(() => {
                setShowResult(false);
                resultScale.value = 0;
                portalRotate.value = 0;
                if (currentIndex < CHALLENGES.length - 1) {
                    setCurrentIndex((i) => i + 1);
                    setCollectedIds(new Set());
                    setIsTransitioning(false);
                } else {
                    setIsFinished(true);
                }
            }, 3000);
        }
    }, [collectedCount, totalStars]);

    // ─── Salva progresso ao finalizar ────────────────────────────────────────
    useEffect(() => {
        if (!isFinished) return;
        completeGame(CHALLENGES.length, CHALLENGES.length);
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

    const portalStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: portalPulse.value * portalScale.value },
            { rotate: `${portalRotate.value}deg` },
        ],
    }));

    const resultStyle = useAnimatedStyle(() => ({
        transform: [{ scale: resultScale.value }],
        opacity: resultScale.value,
    }));

    // ─── Build stars ─────────────────────────────────────────────────────────
    const starsA = Array.from({ length: challenge.groupA }, (_, i) => ({
        id: `A-${currentIndex}-${i}`,
        color: challenge.colorA,
        emoji: challenge.emojiA,
    }));
    const starsB = Array.from({ length: challenge.groupB }, (_, i) => ({
        id: `B-${currentIndex}-${i}`,
        color: challenge.colorB,
        emoji: challenge.emojiB,
    }));

    // ─── Jogo principal ──────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {showResult && <ConfettiEffect />}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { playSound('click'); router.back(); }}
                    style={styles.backButton}
                >
                    <ChevronLeft size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Soma Espacial</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
                </View>
            </View>

            {/* Equação visual */}
            <View style={styles.equationRow}>
                <View style={[styles.eqBox, { borderColor: challenge.colorA }]}>
                    <Text style={[styles.eqNumber, { color: challenge.colorA }]}>{challenge.groupA}</Text>
                </View>
                <Text style={styles.eqOp}>+</Text>
                <View style={[styles.eqBox, { borderColor: challenge.colorB }]}>
                    <Text style={[styles.eqNumber, { color: challenge.colorB }]}>{challenge.groupB}</Text>
                </View>
                <Text style={styles.eqOp}>=</Text>
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

            {/* Hint */}
            <View style={styles.hintBanner}>
                <Text style={styles.hintText}>
                    {isTransitioning
                        ? `🎉 ${challenge.groupA} + ${challenge.groupB} = ${challenge.total}!`
                        : `👆 Toque nas estrelas para enviá-las ao Portal! (${collectedCount}/${totalStars})`}
                </Text>
            </View>

            {/* Área principal: grupo A | portal | grupo B */}
            <View style={styles.gameArea}>
                {/* Grupo A */}
                <View style={styles.sideColumn}>
                    <Text style={[styles.groupLabel, { color: challenge.colorA }]}>
                        {challenge.groupA} {challenge.emojiA}
                    </Text>
                    <View style={styles.starsGrid}>
                        {starsA.map((star) => (
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

                {/* Portal central */}
                <View style={styles.portalColumn}>
                    <Animated.View style={[styles.portalOuter, portalStyle]}>
                        <View style={styles.portalInner}>
                            <View style={styles.portalCore}>
                                {showResult ? (
                                    <Animated.Text entering={ZoomIn} style={styles.portalResultText}>
                                        {challenge.total}
                                    </Animated.Text>
                                ) : (
                                    <Text style={styles.portalCountText}>
                                        {collectedCount}/{totalStars}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                    <Text style={styles.portalLabel}>Portal{'\n'}Espacial</Text>
                </View>

                {/* Grupo B */}
                <View style={styles.sideColumn}>
                    <Text style={[styles.groupLabel, { color: challenge.colorB }]}>
                        {challenge.groupB} {challenge.emojiB}
                    </Text>
                    <View style={styles.starsGrid}>
                        {starsB.map((star) => (
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

            {/* Balloon de acerto */}
            {showResult && (
                <Animated.View
                    entering={BounceIn}
                    exiting={FadeOut}
                    style={styles.announcementBalloon}
                >
                    <Text style={styles.announcementText}>
                        🚀 {challenge.groupA} + {challenge.groupB} = {challenge.total}! Incrível!
                    </Text>
                </Animated.View>
            )}
            {completionState && (
                <GameCompletionModal state={completionState} onContinue={() => router.back()} />
            )}
        </SafeAreaView>
    );
}

// ─── StarTile ────────────────────────────────────────────────────────────────
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
            scale.value = withSequence(withSpring(1.4), withTiming(0, { duration: 280 }));
            opacity.value = withTiming(0, { duration: 320 });
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const PORTAL_SIZE = 110;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0D17' },

    header: {
        padding: 18,
        paddingTop: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12163a',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 6,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
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
    progressText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 15 },

    // Equação
    equationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 20,
    },
    eqBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 2.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eqNumber: { fontSize: 24, fontWeight: '900' },
    eqOp: { fontSize: 26, fontWeight: '900', color: '#94a3b8' },
    eqResultBox: { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' },
    eqResultNumber: { fontSize: 26, fontWeight: '900', color: '#fbbf24' },
    eqBlank: { fontSize: 26, fontWeight: '900', color: '#4b5563' },

    // Hint
    hintBanner: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: '#12163a',
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

    // Game area — 3 colunas
    gameArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        gap: 4,
    },
    sideColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    groupLabel: {
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.4,
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
    starEmoji: { fontSize: 26 },

    // Portal
    portalColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    portalOuter: {
        width: PORTAL_SIZE,
        height: PORTAL_SIZE,
        borderRadius: PORTAL_SIZE / 2,
        backgroundColor: 'rgba(139,92,246,0.18)',
        borderWidth: 2,
        borderColor: 'rgba(167,139,250,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    portalInner: {
        width: PORTAL_SIZE * 0.76,
        height: PORTAL_SIZE * 0.76,
        borderRadius: (PORTAL_SIZE * 0.76) / 2,
        backgroundColor: 'rgba(124,58,237,0.35)',
        borderWidth: 2.5,
        borderColor: '#a78bfa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    portalCore: {
        width: PORTAL_SIZE * 0.48,
        height: PORTAL_SIZE * 0.48,
        borderRadius: (PORTAL_SIZE * 0.48) / 2,
        backgroundColor: '#4c1d95',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#c084fc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 12,
    },
    portalCountText: { color: '#e9d5ff', fontSize: 14, fontWeight: 'bold' },
    portalResultText: { color: '#fff', fontSize: 34, fontWeight: '900' },
    portalLabel: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // Announcement
    announcementBalloon: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#1e2557',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderWidth: 2.5,
        borderColor: '#8b5cf6',
        elevation: 10,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        alignItems: 'center',
    },
    announcementText: {
        fontSize: 17,
        fontWeight: '900',
        color: '#fbbf24',
        textAlign: 'center',
    },

    // Finished
    finishedSafeArea: { flex: 1, backgroundColor: '#0B0D17' },
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
        backgroundColor: '#8b5cf6',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});