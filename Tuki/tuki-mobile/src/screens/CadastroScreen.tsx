import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
    ImageBackground, Pressable, Keyboard, Platform, KeyboardAvoidingView
} from 'react-native';

import { criarUsuario } from '../services/api';
import { salvarUsuario } from '../services/storage';
import { useRouter } from 'expo-router';

const bg = require('../../assets/images/background.jpg');

const AVATARES = [
    { id: 'lion', icon: '🦁' },
    { id: 'frog', icon: '🐸' },
    { id: 'fox', icon: '🦊' },
    { id: 'panda', icon: '🐼' },
    { id: 'cat', icon: '🐱' },
];

export default function CadastroScreen() {
    const [nick, setNick] = useState('');
    const [idade, setIdade] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);
    const idadeRef = useRef<TextInput>(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    const cadastrar = async () => {
        Keyboard.dismiss();
        setErro('');

        if (!nick.trim() || !idade || !avatar) {
            setErro('Preencha todos os campos e escolha um avatar.');
            return;
        }

        const idadeNum = Number(idade);
        if (idadeNum <= 0 || idadeNum > 17) {
            setErro('Idade inválida.');
            return;
        }

        setLoading(true);

        try {
            const usuarioCriado = await criarUsuario({
                nick: nick.trim(),
                idade: idadeNum
            });

            await salvarUsuario({ ...usuarioCriado, avatar });

            // 👇 muda estado visual
            setSucesso(true);

            // 👇 espera um pouco antes de navegar
            setTimeout(() => {
                router.replace({
                    pathname: '/home',
                    params: { nome: nick.trim(), avatar }
                });
            }, 2300);

        } catch (error) {
            setErro('Erro ao conectar com o servidor. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={bg}
            style={styles.background}
            resizeMode="cover"

        >
            <View
                style={{ flex: 1 }}
                onStartShouldSetResponder={() => true}
                onResponderRelease={Keyboard.dismiss}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.overlay} pointerEvents="box-none">
                        <View style={styles.card}>
                            <Text style={styles.title}>Criar Perfil</Text>

                            <Text style={styles.label}>Nome da criança</Text>
                            <TextInput
                                ref={inputRef}
                                placeholder="Ex: Joãozinho"
                                value={nick}
                                onChangeText={(text) => {
                                    const apenasLetras = text.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
                                    setNick(apenasLetras);
                                }}
                                style={styles.input}
                                placeholderTextColor="#999"
                                returnKeyType="next"
                                blurOnSubmit={false}
                                onSubmitEditing={() => idadeRef.current?.focus()}
                            />

                            <Text style={styles.label}>Idade</Text>
                            <TextInput
                                ref={idadeRef}
                                placeholder="Ex: 6"
                                value={idade}
                                onChangeText={(text) => {
                                    const apenasNumeros = text.replace(/[^0-9]/g, '');
                                    setIdade(apenasNumeros);
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                placeholderTextColor="#999"
                            />

                            <Text style={styles.label}>Escolha um avatar</Text>
                            <View style={styles.avatarContainer}>
                                {AVATARES.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => setAvatar(item.id)}
                                        style={[
                                            styles.avatarCircle,
                                            avatar === item.id && styles.avatarSelected
                                        ]}
                                    >
                                        <Text style={{ fontSize: 30 }}>{item.icon}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

                            <TouchableOpacity
                                style={[
                                    styles.buttonMain,
                                    loading && { opacity: 0.6 },
                                    sucesso && { backgroundColor: '#12bd7fff' } // verde sucesso
                                ]}
                                onPress={cadastrar}
                                disabled={loading || sucesso}
                            >
                                <Text style={styles.buttonMainText}>
                                    {loading
                                        ? 'Criando...'
                                        : sucesso
                                            ? 'Perfil criado! 🎉'
                                            : 'Criar Perfil'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Text style={styles.linkText}>Já tenho perfil</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>← Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },

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
        alignItems: 'center',
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
    },

    label: {
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        marginLeft: 5,
    },

    input: {
        backgroundColor: '#FFF9F0',
        width: '100%',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0EAD6',
    },

    avatarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },

    avatarCircle: {
        width: 55,
        height: 55,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },

    avatarSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#EDE9FE',
    },

    errorText: {
        color: '#EF4444',
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },

    buttonMain: {
        backgroundColor: '#7C3AED',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
    },

    buttonMainText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },

    linkText: {
        color: '#7C3AED',
        fontSize: 16,
        fontWeight: '600',
    },

    backButton: {
        marginTop: 20,
        color: '#333',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 3
    },

    backButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    }
});