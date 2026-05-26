import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Circle, Triangle, Square, Star as StarIcon, Hexagon } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    withSequence, withRepeat, runOnJS, Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import ConfettiEffect from '../components/ConfettiEffect';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { registrarProgresso, buscarUsuarioPorId } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SHAPE_COMPONENTS: any = {
    Circle: Circle,
    Triangle: Triangle,
    Square: Square,
    Star: StarIcon,
    Hexagon: Hexagon
};

const SHAPE_NAMES: any = {
    Circle: 'Círculos',
    Triangle: 'Triângulos',
    Square: 'Quadrados',
    Star: 'Estrelas',
    Hexagon: 'Hexágonos'
};

const CHALLENGES = [
    {
        id: 1,
        portalLeft: 'Circle',
        portalRight: 'Triangle',
        asteroids: ['Circle', 'Triangle', 'Circle', 'Triangle', 'Circle']
    },
    {
        id: 2,
        portalLeft: 'Square',
        portalRight: 'Star',
        asteroids: ['Star', 'Square', 'Square', 'Star', 'Square', 'Star']
    },
    {
        id: 3,
        portalLeft: 'Triangle',
        portalRight: 'Hexagon',
        asteroids: ['Hexagon', 'Triangle', 'Hexagon', 'Triangle', 'Triangle', 'Hexagon']
    }
];

const PORTAL_SIZE = 120;
const PORTAL_LEFT_X = PORTAL_SIZE / 2 + 10;
const PORTAL_RIGHT_X = SCREEN_WIDTH - PORTAL_SIZE / 2 - 10;
const PORTAL_Y = SCREEN_HEIGHT * 0.72;
const DROP_RADIUS = 75;

export default function FormasGeometricasScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [droppedIds, setDroppedIds] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [asteroids, setAsteroids] = useState<any[]>([]);

    const challenge = CHALLENGES[currentIndex];

    // Gerar asteroides para o desafio atual
    useEffect(() => {
        if (challenge) {
            setAsteroids(challenge.asteroids.map((shape, idx) => ({
                id: `ast-${currentIndex}-${idx}`,
                shape,
                color: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][Math.floor(Math.random() * 5)],
                scale: 0.8 + Math.random() * 0.5,
                rotation: Math.random() * 360,
                startX: 40 + Math.random() * (SCREEN_WIDTH - 100),
                startY: 120 + Math.random() * (SCREEN_HEIGHT * 0.4)
            })));
        }
    }, [currentIndex, challenge]);

    // Checar conclusão do desafio
    useEffect(() => {
        if (challenge && droppedIds.length === challenge.asteroids.length && challenge.asteroids.length > 0) {
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            setTimeout(() => {
                if (currentIndex < CHALLENGES.length - 1) {
                    setDroppedIds([]);
                    setCurrentIndex(i => i + 1);
                } else {
                    setIsFinished(true);
                }
            }, 1200);
        }
    }, [droppedIds, challenge, currentIndex]);

    // Salvar progresso
    useEffect(() => {
        if (isFinished) {
            playSound('victory');
            const salvar = async () => {
                try {
                    const perfil = await obterPerfilAtivo();
                    if (perfil) {
                        await registrarProgresso({
                            idUsuario: perfil.id,
                            idLicao: 33, // Formas Geométricas – trilha-matematica
                            pontuacao: CHALLENGES.length,
                            tentativas: 1,
                            concluida: true,
                        });
                        const atualizado = await buscarUsuarioPorId(perfil.id);
                        await salvarPerfilAtivo(atualizado);
                    }
                } catch (e) {
                    console.error('Erro ao registrar progresso de Formas:', e);
                }
            };
            salvar();
        }
    }, [isFinished]);

    const handleDrop = (ast: any, targetPortal: 'left' | 'right') => {
        if (!challenge) return false;
        
        const expectedShape = targetPortal === 'left' ? challenge.portalLeft : challenge.portalRight;

        if (ast.shape === expectedShape) {
            setDroppedIds(prev => {
                if (!prev.includes(ast.id)) {
                    return [...prev, ast.id];
                }
                return prev;
            });
            playSound('click'); // Som de acerto/energia
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return true;
        } else {
            playSound('wrong'); // Som de erro ou ricochete
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }
    };

    if (isFinished) {
        return (
            <SafeAreaView style={styles.finishedSafeArea}>
                <ConfettiEffect />
                <View style={styles.finishedContainer}>
                    <Image source={require('../../assets/images/happy-tuki.png')} style={styles.finishedMascot} resizeMode="contain" />
                    <Text style={styles.finishedTitle}>Excelente!</Text>
                    <Text style={styles.finishedSubtitle}>Você organizou toda a galáxia geométrica! 🚀✨</Text>
                    <TouchableOpacity style={styles.backButtonLarge} onPress={() => { playSound('click'); router.back(); }}>
                        <Text style={styles.backButtonText}>Voltar para a Trilha</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Classificador</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
                    </View>
                </View>

                {challenge && (
                    <View style={styles.gameArea} pointerEvents="box-none">
                        <Portal side="left" shape={challenge.portalLeft} />
                        <Portal side="right" shape={challenge.portalRight} />

                        {asteroids.map(ast => {
                            const isDropped = droppedIds.includes(ast.id);
                            return (
                                <DraggableAsteroid
                                    key={ast.id}
                                    ast={ast}
                                    isDropped={isDropped}
                                    portalLeftShape={challenge.portalLeft}
                                    portalRightShape={challenge.portalRight}
                                    onDrop={handleDrop}
                                />
                            );
                        })}
                    </View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

function Portal({ side, shape }: { side: 'left' | 'right', shape: string }) {
    const ShapeIcon = SHAPE_COMPONENTS[shape];
    const x = side === 'left' ? PORTAL_LEFT_X : PORTAL_RIGHT_X;
    const color = side === 'left' ? '#60a5fa' : '#f472b6';
    
    const pulse = useSharedValue(1);
    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.08, { duration: 1500 }),
                withTiming(1.0, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }]
    }));

    return (
        <Animated.View style={[styles.portalWrapper, { left: x - PORTAL_SIZE / 2, top: PORTAL_Y - PORTAL_SIZE / 2 }, animStyle]}>
            <View style={[styles.portalRing, { borderColor: color, shadowColor: color }]}>
                {ShapeIcon && <ShapeIcon size={40} color={color} opacity={0.8} />}
                <Text style={[styles.portalText, { color }]}>{SHAPE_NAMES[shape]}</Text>
            </View>
        </Animated.View>
    );
}

function DraggableAsteroid({ ast, isDropped, portalLeftShape, portalRightShape, onDrop }: any) {
    const x = useSharedValue(ast.startX);
    const y = useSharedValue(ast.startY);
    const scale = useSharedValue(ast.scale);
    const rotation = useSharedValue(ast.rotation);

    const bob = useSharedValue(0);

    useEffect(() => {
        if (!isDropped) {
            bob.value = withRepeat(
                withSequence(
                    withTiming(12, { duration: 1000 + Math.random() * 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-12, { duration: 1000 + Math.random() * 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            rotation.value = withRepeat(
                withTiming(ast.rotation + 360, { duration: 15000 + Math.random() * 10000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            bob.value = 0;
        }
    }, [isDropped]);

    useEffect(() => {
        if (isDropped) {
            // Animate disappearance (brilho estelar)
            scale.value = withTiming(0, { duration: 300 });
        } else {
            // Initial mount or challenge reset
            scale.value = withSpring(ast.scale);
            x.value = withSpring(ast.startX);
            y.value = withSpring(ast.startY);
        }
    }, [isDropped, ast]);

    const drag = Gesture.Pan()
        .onStart(() => {
            if (isDropped) return;
            scale.value = withSpring(ast.scale * 1.3);
            runOnJS(playSound)('click');
        })
        .onUpdate((e) => {
            if (isDropped) return;
            x.value = ast.startX + e.translationX;
            y.value = ast.startY + e.translationY;
        })
        .onEnd(() => {
            if (isDropped) return;

            const currentX = x.value;
            const currentY = y.value;
            
            const distLeft = Math.sqrt(Math.pow(currentX - PORTAL_LEFT_X, 2) + Math.pow(currentY - PORTAL_Y, 2));
            const distRight = Math.sqrt(Math.pow(currentX - PORTAL_RIGHT_X, 2) + Math.pow(currentY - PORTAL_Y, 2));

            let targetPortal: 'left' | 'right' | null = null;
            if (distLeft < DROP_RADIUS) targetPortal = 'left';
            else if (distRight < DROP_RADIUS) targetPortal = 'right';

            if (targetPortal) {
                const expectedShape = targetPortal === 'left' ? portalLeftShape : portalRightShape;
                if (ast.shape === expectedShape) {
                    // Success! Snap to portal center
                    const targetX = targetPortal === 'left' ? PORTAL_LEFT_X : PORTAL_RIGHT_X;
                    x.value = withSpring(targetX - 35);
                    y.value = withSpring(PORTAL_Y - 35);
                    runOnJS(onDrop)(ast, targetPortal);
                } else {
                    // Failed! Snap back
                    scale.value = withSpring(ast.scale);
                    x.value = withSpring(ast.startX);
                    y.value = withSpring(ast.startY);
                    runOnJS(onDrop)(ast, targetPortal);
                }
            } else {
                scale.value = withSpring(ast.scale);
                x.value = withSpring(ast.startX);
                y.value = withSpring(ast.startY);
            }
        });

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value + bob.value },
            { scale: scale.value },
            { rotate: `${rotation.value}deg` }
        ]
    }));

    const ShapeIcon = SHAPE_COMPONENTS[ast.shape];

    return (
        <GestureDetector gesture={drag}>
            <Animated.View pointerEvents={isDropped ? 'none' : 'auto'} style={[styles.asteroidContainer, animStyle]}>
                {ShapeIcon && <ShapeIcon size={65} color="#fff" fill={ast.color} strokeWidth={2} />}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
    progressContainer: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    progressText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 16 },

    gameArea: { flex: 1, position: 'relative' },

    portalWrapper: { position: 'absolute', width: PORTAL_SIZE, height: PORTAL_SIZE, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
    portalRing: { width: PORTAL_SIZE, height: PORTAL_SIZE, borderRadius: PORTAL_SIZE / 2, borderWidth: 4, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15 },
    portalText: { marginTop: 8, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' },

    asteroidContainer: { position: 'absolute', width: 70, height: 70, alignItems: 'center', justifyContent: 'center', shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5, zIndex: 20 },

    finishedSafeArea: { flex: 1, backgroundColor: '#0f172a' },
    finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
    finishedTitle: { fontSize: 38, fontWeight: '900', color: '#38bdf8', marginBottom: 10, textAlign: 'center' },
    finishedSubtitle: { fontSize: 20, color: '#94a3b8', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
    backButtonLarge: { backgroundColor: '#38bdf8', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4, shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
