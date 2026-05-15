import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ActivityIndicator,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LandingScreen from '../src/screens/LandingScreen';
import { obterResponsavel } from '../src/services/storage';

const bg   = require('../assets/images/background.jpg');
const logo = require('../assets/images/tuki-logo-voando.png');

export default function Index() {
    const router = useRouter();
    const { skipIntro } = useLocalSearchParams();
    const [estaLogado,  setEstaLogado]  = useState(false);
    const [showLanding, setShowLanding] = useState(false);
    
    // Controle de montagem física para evitar erros de aria-hidden no web
    const [introVisible, setIntroVisible] = useState(true);
    const [loadingVisible, setLoadingVisible] = useState(false);

    const useNativeDriver = Platform.OS !== 'web';

    // ── opacidades das camadas (todas montadas desde o início) ──────
    const introOpacity   = useRef(new Animated.Value(1)).current;
    const loadingOpacity = useRef(new Animated.Value(0)).current;
    const landingOpacity = useRef(new Animated.Value(0)).current;

    // ── animações da intro ─────────────────────────────────────────
    const logoFade  = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoFloat = useRef(new Animated.Value(0)).current;

    // ── animações do loading ───────────────────────────────────────
    const pulseScale = useRef(new Animated.Value(1)).current;
    const pulseFade  = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (skipIntro === 'true') {
            // Pula direto para a landing page (usuário acabou de sair da conta)
            introOpacity.setValue(0);
            loadingOpacity.setValue(0);
            landingOpacity.setValue(1);
            setShowLanding(true);
            setIntroVisible(false);
            setLoadingVisible(false);
            return;
        }

        // 1) Inicia animação do logo (fade-in + spring)
        Animated.parallel([
            Animated.timing(logoFade, {
                toValue: 1, duration: 700, useNativeDriver,
            }),
            Animated.spring(logoScale, {
                toValue: 1, friction: 5, tension: 60, useNativeDriver,
            }),
        ]).start(() => {
            // 2) Flutuação em loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(logoFloat, { toValue: -18, duration: 900, useNativeDriver }),
                    Animated.timing(logoFloat, { toValue: 0,   duration: 900, useNativeDriver }),
                ])
            ).start();

            // 3) Após 2s → crossfade intro → loading
            setTimeout(() => {
                setLoadingVisible(true);
                startPulse();
                Animated.parallel([
                    Animated.timing(introOpacity,   { toValue: 0, duration: 600, useNativeDriver }),
                    Animated.timing(loadingOpacity, { toValue: 1, duration: 600, useNativeDriver }),
                ]).start(() => {
                    setIntroVisible(false);
                    // 4) Verifica auth com delay mínimo de 2s
                    checkAuth();
                });
            }, 2000);
        });
    }, []);

    const startPulse = () => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseScale, { toValue: 1.08, duration: 800, useNativeDriver }),
                    Animated.timing(pulseScale, { toValue: 1,    duration: 800, useNativeDriver }),
                ]),
                Animated.sequence([
                    Animated.timing(pulseFade, { toValue: 1,   duration: 800, useNativeDriver }),
                    Animated.timing(pulseFade, { toValue: 0.5, duration: 800, useNativeDriver }),
                ]),
            ])
        ).start();
    };

    const checkAuth = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const responsavel = await obterResponsavel();

            if (responsavel) {
                setEstaLogado(true);
                router.replace('/home');
            } else {
                // 5) Crossfade loading → landing
                setShowLanding(true);
                Animated.parallel([
                    Animated.timing(loadingOpacity, { toValue: 0, duration: 600, useNativeDriver }),
                    Animated.timing(landingOpacity, { toValue: 1, duration: 600, useNativeDriver }),
                ]).start(() => {
                    setLoadingVisible(false);
                });
            }
        } catch (error) {
            console.error('Erro no checkAuth:', error);
            setShowLanding(true);
            Animated.parallel([
                Animated.timing(loadingOpacity, { toValue: 0, duration: 600, useNativeDriver }),
                Animated.timing(landingOpacity, { toValue: 1, duration: 600, useNativeDriver }),
            ]).start(() => {
                setLoadingVisible(false);
            });
        }
    };

    if (estaLogado) return null;

    return (
        <View style={styles.root}>

            {/* ── Camada 3: Landing Screen ── */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject, 
                    { 
                        opacity: landingOpacity,
                        display: showLanding ? 'flex' : 'none'
                    }
                ]}
                pointerEvents={showLanding ? 'auto' : 'none'}
            >
                <LandingScreen />
            </Animated.View>

            {/* ── Camada 2: Loading ── */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject, 
                    { 
                        opacity: loadingOpacity,
                        display: loadingVisible ? 'flex' : 'none'
                    }
                ]}
                pointerEvents="none"
            >
                <ImageBackground source={bg} style={styles.fill} resizeMode="cover">
                    <View style={styles.center}>
                        <Animated.View
                            style={[
                                styles.loadingCard,
                                { transform: [{ scale: pulseScale }], opacity: pulseFade },
                            ]}
                        >
                            <ActivityIndicator size={60} color="#7C3AED" style={{ marginBottom: 15 }} />
                            <Text style={styles.loadingText}>Carregando...</Text>
                            <Text style={styles.subText}>Preparando a diversão!</Text>
                        </Animated.View>
                    </View>
                </ImageBackground>
            </Animated.View>

            {/* ── Camada 1: Intro ── */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject, 
                    styles.introContainer, 
                    { 
                        opacity: introOpacity,
                        display: introVisible ? 'flex' : 'none'
                    }
                ]}
                pointerEvents="none"
            >
                <Animated.Image
                    source={logo}
                    style={[
                        styles.logoIntro,
                        {
                            opacity: logoFade,
                            transform: [
                                { scale: logoScale },
                                { translateY: logoFloat },
                            ],
                        },
                    ]}
                    resizeMode="contain"
                />
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F5F0FF',
    },
    fill: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    center: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        backgroundColor: '#FFF',
        paddingHorizontal: 40,
        paddingVertical: 30,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    loadingText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#7C3AED',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    introContainer: {
        backgroundColor: '#F5F0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIntro: {
        width: 260,
        height: 260,
    },
});