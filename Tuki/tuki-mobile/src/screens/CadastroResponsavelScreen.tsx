import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { criarResponsavel } from '../services/api';
import { salvarResponsavel } from '../services/storage';

const bg = require('../../assets/images/background.jpg');

export default function CadastroResponsavelScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const router = useRouter();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

                            <TouchableOpacity style={styles.button} onPress={continuar}>
                                <Text style={styles.buttonText}>Continuar</Text>
                            </TouchableOpacity>

                            {/* Link to login for existing users */}
                            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
                                <Text style={styles.linkText}>Já tenho conta →</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.backButtonText}>← Voltar</Text>
                        </TouchableOpacity>
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
        marginTop: 20,
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 3
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