import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { criarResponsavel } from '../services/api';
import { salvarResponsavel } from '../services/storage';

const bg = require('../../assets/images/background.jpg');

// Wrapper genérico para botões com animação de toque (escala e opacidade)
function AnimatedPressable({ onPress, style, children }: { onPress: () => void, style?: any, children: React.ReactNode }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const useNativeDriver = Platform.OS !== 'web';

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.92, useNativeDriver, speed: 30, bounciness: 6 }),
            Animated.timing(opacity, { toValue: 0.7, duration: 80, useNativeDriver }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver, speed: 20, bounciness: 10 }),
            Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver }),
        ]).start();
    };

    const handlePress = () => {
        // Aguarda um instante para a animação ser percebida antes da navegação
        setTimeout(() => {
            onPress();
        }, 150);
    };

    return (
        <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}

const backBtnStyle = StyleSheet.create({
    btn: {
        marginTop: 16,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    txt: {
        color: '#333',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default function CadastroResponsavelScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const router = useRouter();
    const { from } = useLocalSearchParams();

    const handleJaTenhoConta = () => {
        if (from === 'login') {
            router.back();
        } else {
            router.push({ pathname: '/login', params: { from: 'cadastro' } });
        }
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Animação de entrada do card
    const cardY    = useRef(new Animated.Value(60)).current;
    const cardFade = useRef(new Animated.Value(0)).current;
    const useNativeDriver = Platform.OS !== 'web';

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardY, {
                toValue: 0,
                duration: 420,
                useNativeDriver,
            }),
            Animated.timing(cardFade, {
                toValue: 1,
                duration: 420,
                useNativeDriver,
            }),
        ]).start();
    }, []);

    const continuar = async () => {
        if (!emailRegex.test(email)) {
            setErro('Por favor, insira um e-mail válido.');
            return;
        }

        if (senha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setErro('');

        try {

            setErro('');

            const resposta = await criarResponsavel({
                email,
                senha
            });

            await salvarResponsavel(resposta);

            router.replace('/cadastro-crianca');

        } catch (error: any) {
            const msg = error.message || '';
            if (msg.includes('409')) {
                setErro('Este e-mail já está cadastrado.');
            } else {
                setErro('Erro ao conectar com o servidor.');
            }
        }

    };

    return (
        <ImageBackground source={bg} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.overlay}>
                        <Animated.View
                            style={{ opacity: cardFade, transform: [{ translateY: cardY }] }}
                        >
                            <View style={styles.card}>
                                <Text style={styles.title}>Cadastro do Responsável</Text>

                                <Text style={styles.label}>E-mail</Text>
                                <TextInput
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <Text style={styles.label}>Senha</Text>
                                <TextInput
                                    placeholder="Mínimo de 6 caracteres"
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    secureTextEntry
                                />

                                <Text style={styles.label}>Confirmar Senha</Text>
                                <TextInput
                                    placeholder="Confirme sua senha"
                                    placeholderTextColor="#999"
                                    value={confirmarSenha}
                                    onChangeText={setConfirmarSenha}
                                    style={styles.input}
                                    secureTextEntry
                                />

                                {erro ? <Text style={styles.error}>{erro}</Text> : null}

                                <AnimatedPressable style={styles.button} onPress={continuar}>
                                    <Text style={styles.buttonText}>Continuar</Text>
                                </AnimatedPressable>

                                {/* Link to login for existing users */}
                                <AnimatedPressable style={styles.linkButton} onPress={handleJaTenhoConta}>
                                    <Text style={styles.linkText}>Já tenho conta</Text>
                                </AnimatedPressable>
                            </View>

                            <AnimatedPressable style={backBtnStyle.btn} onPress={() => router.back()}>
                                <Text style={backBtnStyle.txt}>Voltar</Text>
                            </AnimatedPressable>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 40,
        padding: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#444',
        marginBottom: 25,
        textAlign: 'center'
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        marginLeft: 5
    },
    input: {
        backgroundColor: '#FFF9F0',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0EAD6'
    },
    button: {
        backgroundColor: '#7C3AED',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800'
    },
    error: {
        color: '#EF4444',
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '600'
    },
    backButton: {
        marginTop: 16,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    linkButton: {
        marginTop: 10,
        alignItems: 'center'
    },
    linkText: {
        color: '#7C3AED',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 5
    },

    backButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    }
}
);