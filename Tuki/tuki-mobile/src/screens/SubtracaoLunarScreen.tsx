import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Rocket, BatteryCharging } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    withSequence, withRepeat, runOnJS, Easing, ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHALLENGES = [
    { id: 1, start: 7, sub: 2, end: 5 },
    { id: 2, start: 9, sub: 3, end: 6 },
    { id: 3, start: 5, sub: 4, end: 1 },
    { id: 4, start: 8, sub: 5, end: 3 },
    { id: 5, start: 10, sub: 3, end: 7 }
];

const PADDING_HORIZONTAL = 20;
const NUMBER_COUNT = 10;
const NUMBER_WIDTH = (SCREEN_WIDTH - PADDING_HORIZONTAL * 2) / NUMBER_COUNT;

export default function SubtracaoLunarScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [fuel, setFuel] = useState(0);

    const challenge = CHALLENGES[currentIndex];

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
                            idLicao: 32, // Subtração Lunar – trilha-matematica
                            pontuacao: CHALLENGES.length,
                            tentativas: 1,
                            concluida: true,
                        });
                        const atualizado = await buscarUsuarioPorId(perfil.id);
                        await salvarPerfilAtivo(atualizado);
                    }
                } catch (e) {
                    console.error('Erro ao registrar progresso de Subtração Lunar:', e);
                }
            };
            salvar();
        }
    }, [isFinished]);

    if (isFinished) {
        return (
            <SafeAreaView style={styles.finishedSafeArea}>
                <ConfettiEffect />
                <View style={styles.finishedContainer}>
                    <Image source={require('../../assets/images/happy-tuki.png')} style={styles.finishedMascot} resizeMode="contain" />
                    <Text style={styles.finishedTitle}>Missão Cumprida!</Text>
                    <Text style={styles.finishedSubtitle}>Tanque cheio! O foguete está pronto para explorar! 🚀🌕</Text>
                    <TouchableOpacity style={styles.backButtonLarge} onPress={() => { playSound('click'); router.back(); }}>
                        <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderVisualEquation = () => {
        if (!challenge) return null;
        return (
            <View style={styles.equationRow}>
                <View style={[styles.eqBox, { borderColor: '#60a5fa' }]}>
                    <Text style={[styles.eqNumber, { color: '#60a5fa' }]}>{challenge.start}</Text>
                </View>
                <Text style={styles.eqText}>-</Text>
                <View style={[styles.eqBox, { borderColor: '#f87171' }]}>
                    <Text style={[styles.eqNumber, { color: '#f87171' }]}>{challenge.sub}</Text>
                </View>
                <Text style={styles.eqText}>=</Text>
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
                    <Text style={styles.headerTitle}>Subtração Lunar</Text>
                    <View style={styles.progressContainer}>
                        <BatteryCharging size={20} color="#34d399" />
                        <Text style={styles.progressText}>{fuel}/{CHALLENGES.length}</Text>
                    </View>
                </View>

                {renderVisualEquation()}

                <View style={styles.gameArea}>
                    <Text style={styles.hintText}>Arraste o foguete para trás e resolva a subtração!</Text>

                    <View style={styles.numberLineContainer}>
                        <View style={styles.numberLineBase} />
                        
                        {Array.from({ length: NUMBER_COUNT }).map((_, i) => {
                            const num = i + 1;
                            const isActive = showResult ? num === challenge?.end : num === challenge?.start;
                            return (
                                <View key={num} style={[styles.numberNode, { left: i * NUMBER_WIDTH }]}>
                                    <View style={[styles.nodeTick, isActive && styles.nodeTickActive]} />
                                    <Text style={[styles.nodeText, isActive && styles.nodeTextActive]}>{num}</Text>
                                </View>
                            );
                        })}

                        {challenge && !showResult && (
                            <DraggableRocket
                                challenge={challenge}
                                onSuccess={() => {
                                    setShowResult(true);
                                    setFuel(f => f + 1);
                                    playSound('correct');
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    setTimeout(() => {
                                        if (currentIndex < CHALLENGES.length - 1) {
                                            setShowResult(false);
                                            setCurrentIndex(i => i + 1);
                                        } else {
                                            setIsFinished(true);
                                        }
                                    }, 3000);
                                }}
                            />
                        )}

                        {challenge && showResult && (
                            <Animated.View entering={ZoomIn} style={[styles.rocketWrapper, { left: (challenge.end - 1) * NUMBER_WIDTH - 25 }]}>
                                <Rocket size={45} color="#34d399" fill="#34d399" style={{ transform: [{ rotate: '-45deg' }] }} />
                            </Animated.View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

function DraggableRocket({ challenge, onSuccess }: any) {
    const startX = (challenge.start - 1) * NUMBER_WIDTH - 25 + (NUMBER_WIDTH / 2);
    
    // We add NUMBER_WIDTH/2 so it centers on the tick. 
    // Let's recalibrate: the ticks are at `left: i * NUMBER_WIDTH`. 
    // They have width 20, so center is `i * NUMBER_WIDTH + 10`.
    // The rocket has width 50, so left should be `i * NUMBER_WIDTH + 10 - 25` = `i * NUMBER_WIDTH - 15`.
    
    const calibratedStartX = (challenge.start - 1) * NUMBER_WIDTH - 15;

    const x = useSharedValue(calibratedStartX);
    const y = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        x.value = withSpring(calibratedStartX);
        y.value = withSpring(0);
        scale.value = withSpring(1);
    }, [challenge, calibratedStartX]);

    const bob = useSharedValue(0);
    useEffect(() => {
        bob.value = withRepeat(
            withSequence(
                withTiming(8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const drag = Gesture.Pan()
        .onStart(() => {
            scale.value = withSpring(1.3);
            runOnJS(playSound)('click');
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        })
        .onUpdate((e) => {
            x.value = calibratedStartX + e.translationX;
            y.value = Math.min(0, e.translationY);
        })
        .onEnd((e) => {
            scale.value = withSpring(1);
            
            const currentX = x.value;
            // Snapping logic: find index
            const closestIndex = Math.round((currentX + 15) / NUMBER_WIDTH);
            const snappedX = closestIndex * NUMBER_WIDTH - 15;
            const droppedNumber = closestIndex + 1;

            if (droppedNumber === challenge.end) {
                x.value = withSpring(snappedX);
                y.value = withSpring(0);
                runOnJS(onSuccess)();
            } else {
                runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error);
                x.value = withSequence(
                    withTiming(calibratedStartX - 15, { duration: 80 }),
                    withTiming(calibratedStartX + 15, { duration: 80 }),
                    withTiming(calibratedStartX - 10, { duration: 80 }),
                    withTiming(calibratedStartX + 10, { duration: 80 }),
                    withSpring(calibratedStartX)
                );
                y.value = withSpring(0);
            }
        });

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value + bob.value },
            { scale: scale.value }
        ]
    }));

    return (
        <GestureDetector gesture={drag}>
            <Animated.View style={[styles.rocketWrapper, animStyle]}>
                <Rocket size={45} color="#fbbf24" fill="#fbbf24" style={{ transform: [{ rotate: '-45deg' }] }} />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    header: { padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
    progressText: { color: '#34d399', fontWeight: 'bold', fontSize: 16 },

    equationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 20, gap: 12, zIndex: 10 },
    eqBox: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.05)' },
    eqNumber: { fontSize: 32, fontWeight: '900' },
    eqText: { fontSize: 32, fontWeight: '900', color: '#94a3b8' },
    eqResultBox: { borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' },
    eqResultNumber: { fontSize: 34, fontWeight: '900', color: '#fbbf24' },
    eqBlank: { fontSize: 32, fontWeight: '900', color: '#4b5563' },

    gameArea: { flex: 1, justifyContent: 'center', paddingHorizontal: PADDING_HORIZONTAL },
    hintText: { color: '#a5b4fc', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 80 },
    
    numberLineContainer: { position: 'relative', height: 120, justifyContent: 'flex-end', paddingBottom: 20 },
    numberLineBase: { position: 'absolute', bottom: 42, left: 0, right: 0, height: 6, backgroundColor: '#3730a3', borderRadius: 3 },
    numberNode: { position: 'absolute', bottom: 25, width: 20, alignItems: 'center', marginLeft: 0 },
    nodeTick: { width: 4, height: 16, backgroundColor: '#4f46e5', borderRadius: 2, marginBottom: 8 },
    nodeTickActive: { backgroundColor: '#fbbf24', height: 22 },
    nodeText: { color: '#6366f1', fontSize: 16, fontWeight: 'bold' },
    nodeTextActive: { color: '#fbbf24', fontSize: 22, fontWeight: '900' },

    rocketWrapper: { position: 'absolute', bottom: 65, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', zIndex: 20 },

    finishedSafeArea: { flex: 1, backgroundColor: '#1e1b4b' },
    finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
    finishedTitle: { fontSize: 38, fontWeight: '900', color: '#34d399', marginBottom: 10, textAlign: 'center' },
    finishedSubtitle: { fontSize: 20, color: '#94a3b8', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
    backButtonLarge: { backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
