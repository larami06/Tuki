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
    BounceIn,
    FadeIn,
    FadeOut,
    ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';
import ExitConfirmModal from '../components/ExitConfirmModal';

// ─── Formas disponíveis ───────────────────────────────────────────────────────
type ShapeKey = 'Círculo' | 'Triângulo' | 'Quadrado' | 'Estrela' | 'Hexágono';

const SHAPE_EMOJIS: Record<ShapeKey, string> = {
    Círculo: '⭕',
    Triângulo: '🔺',
    Quadrado: '🟥',
    Estrela: '⭐',
    Hexágono: '🔷',
};

// ─── Desafios ────────────────────────────────────────────────────────────────
interface Challenge {
    id: number;
    bucketLeft: ShapeKey;
    bucketRight: ShapeKey;
    items: { shape: ShapeKey; id: string }[];
}

const CHALLENGES: Challenge[] = [
    {
        id: 1,
        bucketLeft: 'Círculo',
        bucketRight: 'Triângulo',
        items: [
            { id: 'c1', shape: 'Círculo' },
            { id: 't1', shape: 'Triângulo' },
            { id: 'c2', shape: 'Círculo' },
            { id: 't2', shape: 'Triângulo' },
            { id: 'c3', shape: 'Círculo' },
        ],
    },
    {
        id: 2,
        bucketLeft: 'Quadrado',
        bucketRight: 'Estrela',
        items: [
            { id: 'e1', shape: 'Estrela' },
            { id: 'q1', shape: 'Quadrado' },
            { id: 'q2', shape: 'Quadrado' },
            { id: 'e2', shape: 'Estrela' },
            { id: 'q3', shape: 'Quadrado' },
            { id: 'e3', shape: 'Estrela' },
        ],
    },
    {
        id: 3,
        bucketLeft: 'Triângulo',
        bucketRight: 'Hexágono',
        items: [
            { id: 'h1', shape: 'Hexágono' },
            { id: 't1', shape: 'Triângulo' },
            { id: 'h2', shape: 'Hexágono' },
            { id: 't2', shape: 'Triângulo' },
            { id: 't3', shape: 'Triângulo' },
            { id: 'h3', shape: 'Hexágono' },
        ],
    },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function FormasGeometricasScreen() {
    const router = useRouter();
    const { completionState, completeGame } = useGameCompletion(33);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sorted, setSorted] = useState<Record<string, 'left' | 'right' | 'wrong'>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const challenge = CHALLENGES[currentIndex];
    const totalItems = challenge.items.length;
    const correctlySorted = Object.values(sorted).filter((v) => v === 'left' || v === 'right').length;

    // Verifica conclusão do desafio
    useEffect(() => {
        if (correctlySorted === totalItems && totalItems > 0 && !isTransitioning) {
            setIsTransitioning(true);
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                if (currentIndex < CHALLENGES.length - 1) {
                    setCurrentIndex((i) => i + 1);
                    setSorted({});
                    setIsTransitioning(false);
                } else {
                    setIsFinished(true);
                }
            }, 1400);
        }
    }, [correctlySorted, totalItems]);

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

    const handleSort = useCallback((itemId: string, shape: ShapeKey, bucket: 'left' | 'right') => {
        const expected = bucket === 'left' ? challenge.bucketLeft : challenge.bucketRight;
        if (shape === expected) {
            setSorted((prev) => ({ ...prev, [itemId]: bucket }));
            playSound('click');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            setSorted((prev) => ({ ...prev, [itemId]: 'wrong' }));
            playSound('wrong');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            // Reseta o erro após 700ms para permitir nova tentativa
            setTimeout(() => {
                setSorted((prev) => {
                    const next = { ...prev };
                    if (next[itemId] === 'wrong') delete next[itemId];
                    return next;
                });
            }, 700);
        }
    }, [challenge]);

    const unsortedItems = challenge.items.filter((item) => !sorted[item.id] || sorted[item.id] === 'wrong');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { playSound('click'); setShowExitModal(true); }}
                    style={styles.backButton}
                >
                    <ChevronLeft size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Formas Geométricas</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
                </View>
            </View>

            {/* Hint */}
            <Animated.View entering={FadeIn} key={`hint-${currentIndex}`} style={styles.hintBanner}>
                <Text style={styles.hintText}>
                    📦 Toque na forma e depois no balde correto!
                </Text>
            </Animated.View>

            {/* Progresso */}
            <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                    ✅ {correctlySorted}/{totalItems} classificados
                </Text>
            </View>

            {/* Baldes (destinos) */}
            <View style={styles.bucketsRow}>
                <BucketZone
                    shape={challenge.bucketLeft}
                    side="left"
                    color="#60a5fa"
                    items={challenge.items.filter((i) => sorted[i.id] === 'left')}
                />
                <BucketZone
                    shape={challenge.bucketRight}
                    side="right"
                    color="#f472b6"
                    items={challenge.items.filter((i) => sorted[i.id] === 'right')}
                />
            </View>

            {/* Itens para classificar */}
            <View style={styles.itemsArea}>
                <Text style={styles.itemsLabel}>Classifique estas formas:</Text>
                <View style={styles.itemsGrid}>
                    {unsortedItems.map((item) => {
                        const isWrong = sorted[item.id] === 'wrong';
                        return (
                            <ShapeCard
                                key={item.id}
                                item={item}
                                isWrong={isWrong}
                                bucketLeft={challenge.bucketLeft}
                                bucketRight={challenge.bucketRight}
                                onSort={handleSort}
                            />
                        );
                    })}
                </View>
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

// ─── BucketZone ──────────────────────────────────────────────────────────────
function BucketZone({
    shape,
    side,
    color,
    items,
}: {
    shape: ShapeKey;
    side: 'left' | 'right';
    color: string;
    items: { shape: ShapeKey; id: string }[];
}) {
    const scale = useSharedValue(1);
    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1200 }),
                withTiming(1.0, { duration: 1200 })
            ),
            -1,
            true
        );
        return () => cancelAnimation(scale);
    }, []);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={[styles.bucket, { borderColor: color }, animStyle]}>
            <Text style={[styles.bucketLabel, { color }]}>{SHAPE_EMOJIS[shape]}</Text>
            <Text style={[styles.bucketName, { color }]}>{shape}s</Text>
            <View style={styles.bucketItems}>
                {items.map((item) => (
                    <Animated.Text key={item.id} entering={BounceIn} style={styles.bucketItemEmoji}>
                        {SHAPE_EMOJIS[item.shape]}
                    </Animated.Text>
                ))}
            </View>
        </Animated.View>
    );
}

// ─── ShapeCard com modal de escolha ──────────────────────────────────────────
function ShapeCard({
    item,
    isWrong,
    bucketLeft,
    bucketRight,
    onSort,
}: {
    item: { id: string; shape: ShapeKey };
    isWrong: boolean;
    bucketLeft: ShapeKey;
    bucketRight: ShapeKey;
    onSort: (id: string, shape: ShapeKey, bucket: 'left' | 'right') => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const scale = useSharedValue(1);
    const shake = useSharedValue(0);

    useEffect(() => {
        if (isWrong) {
            shake.value = withSequence(
                withTiming(-8, { duration: 60 }),
                withTiming(8, { duration: 60 }),
                withTiming(-8, { duration: 60 }),
                withTiming(0, { duration: 60 })
            );
            scale.value = withSequence(withSpring(0.85), withSpring(1));
            setExpanded(false);
        }
    }, [isWrong]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateX: shake.value }],
    }));

    if (expanded) {
        return (
            <Animated.View entering={ZoomIn} style={styles.shapeCardExpanded}>
                <Text style={styles.shapeCardEmojiBig}>{SHAPE_EMOJIS[item.shape]}</Text>
                <Text style={styles.chooseLabel}>Onde vai?</Text>
                <View style={styles.chooseRow}>
                    <TouchableOpacity
                        style={[styles.chooseBtn, { borderColor: '#60a5fa' }]}
                        onPress={() => { setExpanded(false); onSort(item.id, item.shape, 'left'); }}
                    >
                        <Text style={styles.chooseBtnEmoji}>{SHAPE_EMOJIS[bucketLeft]}</Text>
                        <Text style={[styles.chooseBtnLabel, { color: '#60a5fa' }]}>{bucketLeft}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chooseBtn, { borderColor: '#f472b6' }]}
                        onPress={() => { setExpanded(false); onSort(item.id, item.shape, 'right'); }}
                    >
                        <Text style={styles.chooseBtnEmoji}>{SHAPE_EMOJIS[bucketRight]}</Text>
                        <Text style={[styles.chooseBtnLabel, { color: '#f472b6' }]}>{bucketRight}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setExpanded(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>✕</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
                scale.value = withSequence(withSpring(0.9), withSpring(1));
                setExpanded(true);
            }}
        >
            <Animated.View
                style={[
                    styles.shapeCard,
                    isWrong && styles.shapeCardWrong,
                    animStyle,
                ]}
            >
                <Text style={styles.shapeEmoji}>{SHAPE_EMOJIS[item.shape]}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    header: {
        padding: 18,
        paddingTop: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    progressText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 14 },

    hintBanner: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: 'rgba(56,189,248,0.08)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.2)',
    },
    hintText: { color: '#7dd3fc', fontSize: 13, fontWeight: '700', textAlign: 'center' },

    progressRow: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    progressLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },

    // Baldes
    bucketsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        gap: 12,
    },
    bucket: {
        flex: 1,
        borderWidth: 2.5,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        minHeight: 110,
    },
    bucketLabel: { fontSize: 28 },
    bucketName: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
    bucketItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
        marginTop: 6,
    },
    bucketItemEmoji: { fontSize: 20 },

    // Área de itens
    itemsArea: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 12,
    },
    itemsLabel: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },

    // ShapeCard
    shapeCard: {
        width: 70,
        height: 70,
        borderRadius: 18,
        backgroundColor: '#1e293b',
        borderWidth: 2,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    shapeCardWrong: {
        borderColor: '#ef4444',
        backgroundColor: '#450a0a',
    },
    shapeEmoji: { fontSize: 34 },

    // Expandido
    shapeCardExpanded: {
        width: Dimensions.get('window').width - 80,
        backgroundColor: '#1e293b',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#334155',
        padding: 20,
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    shapeCardEmojiBig: { fontSize: 52, marginBottom: 8 },
    chooseLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '700', marginBottom: 14 },
    chooseRow: { flexDirection: 'row', gap: 12 },
    chooseBtn: {
        flex: 1,
        borderWidth: 2.5,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    chooseBtnEmoji: { fontSize: 30, marginBottom: 4 },
    chooseBtnLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    cancelBtn: {
        marginTop: 12,
        padding: 6,
    },
    cancelBtnText: { color: '#475569', fontSize: 18, fontWeight: 'bold' },

    // Finished
    finishedSafeArea: { flex: 1, backgroundColor: '#0f172a' },
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
    finishedTitle: { fontSize: 32, fontWeight: '900', color: '#38bdf8', marginBottom: 10 },
    finishedSubtitle: { fontSize: 18, color: '#94a3b8', marginBottom: 36, textAlign: 'center', lineHeight: 26 },
    backButtonLarge: {
        backgroundColor: '#38bdf8',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
