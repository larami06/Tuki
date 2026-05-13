import React, { useState, useEffect, useRef } from 'react';
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
    Keyboard,
    ActivityIndicator,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { criarUsuario } from '../services/api';
import { obterResponsavel } from '../services/storage';
import { useAuth } from '../../app/hooks/useAuth';

const bg = require('../../assets/images/background.jpg');

const AVATARES = [
    { id: 'avatar_1', source: require('../../assets/images/avatar_1.jpg') },
    { id: 'avatar_2', source: require('../../assets/images/avatar_2.jpg') },
    { id: 'avatar_3', source: require('../../assets/images/avatar_3.jpg') },
    { id: 'avatar_4', source: require('../../assets/images/avatar_4.jpg') },
    { id: 'avatar_5', source: require('../../assets/images/avatar_5.jpg') },
];

export default function CadastroCriancaScreen() {
    const { loading: authLoading } = useAuth();
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const idadeRef = useRef<TextInput>(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    if (authLoading) {
        return null;
    }

    const salvarCrianca = async () => {
        Keyboard.dismiss();
        setErro('');

        if (!nome.trim() || !idade || !avatar) {
            setErro('Preencha todos os campos e escolha um avatar.');
            return;
        }

        setLoading(true);
        try {
            const responsavel = await obterResponsavel();

            if (!responsavel) {
                setErro('Sessão expirada. Faça login novamente.');
                router.replace('/login');
                return;
            }

            await criarUsuario({
                nick: nome.trim(),
                idade: parseInt(idade),
                idResponsavel: responsavel.id,
                avatar: avatar!
            });

            // Sucesso! Volta para a seleção de perfil
            router.replace('/selecionar-perfil');
        } catch (error: any) {
            const msg = error.message || '';
            if (msg.includes('409')) {
                setErro('Já existe um perfil com esse nome. Tente outro.');
            } else if (msg.includes('400')) {
                setErro('Sessão expirada. Faça login novamente.');
                router.replace('/login');
            } else {
                setErro('Erro ao conectar com o servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={bg} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.overlay}>
                        <View style={styles.card}>
                            <Text style={styles.title}>Criar Novo Perfil</Text>
                            <Text style={styles.subtitle}>Crie um perfil infantil</Text>

                            <Text style={styles.label}>Nome da criança</Text>
                            <TextInput
                                ref={inputRef}
                                placeholder="Ex: Joãozinho"
                                value={nome}
                                onChangeText={(text) => setNome(text.replace(/[^A-Za-zÀ-ÿ\s]/g, ''))}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />

                            <Text style={styles.label}>Idade</Text>
                            <TextInput
                                ref={idadeRef}
                                placeholder="Ex: 6"
                                value={idade}
                                onChangeText={(text) => setIdade(text.replace(/[^0-9]/g, ''))}
                                style={styles.input}
                                keyboardType="numeric"
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
                                        <Image source={item.source} style={{ width: 45, height: 45, borderRadius: 22 }} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

                            <TouchableOpacity
                                style={[styles.buttonMain, loading && { opacity: 0.6 }]}
                                disabled={loading}
                                onPress={salvarCrianca}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonMainText}>Salvar Perfil</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                                disabled={loading}
                            >
                                <Text style={styles.backButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: {
        backgroundColor: '#FFF', width: '100%', borderRadius: 40, padding: 30,
        elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2, shadowRadius: 10,
    },
    title: { fontSize: 26, fontWeight: '800', color: '#7C3AED', marginBottom: 5, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 25, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 10 },
    input: {
        backgroundColor: '#F3F4F6', borderRadius: 15, padding: 15, fontSize: 16,
        color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10
    },
    avatarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
    avatarCircle: {
        width: 55, height: 55, borderRadius: 28, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent'
    },
    avatarSelected: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
    buttonMain: {
        backgroundColor: '#7C3AED', borderRadius: 20, padding: 18,
        alignItems: 'center', marginTop: 25, elevation: 5
    },
    buttonMainText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    backButton: { marginTop: 15, alignItems: 'center' },
    backButtonText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
    errorText: { color: '#EF4444', fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
});