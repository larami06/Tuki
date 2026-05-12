import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { buscarPerfisDoResponsavel } from '../services/api';
import { obterResponsavel, logout, salvarPerfilAtivo } from '../services/storage';
import { useAuth } from '../../app/hooks/useAuth';
import { Stack } from 'expo-router';

const bg = require('../../assets/images/background.jpg');

const AVATARES_MAP: Record<string, string> = {
    avatar_1: '🐸',
    avatar_2: '🐼',
    avatar_3: '🦊',
    avatar_4: '🦁',
    avatar_5: '🐱',
};

export default function SelecionarPerfilScreen() {
    const { loading: authLoading } = useAuth();
    const router = useRouter();
    const [perfis, setPerfis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        carregarPerfis();
    }, []);

    const carregarPerfis = async () => {
        try {
            const responsavel = await obterResponsavel();
            if (responsavel) {
                const data = await buscarPerfisDoResponsavel(responsavel.id);
                setPerfis(data);
            }
        } catch (error) {
            console.error('Erro ao buscar perfis:', error);
        } finally {
            setLoading(false);
        }
    };

    const entrarPerfil = async (perfil: any) => {
        await salvarPerfilAtivo(perfil);
        router.push('/home');
    };

    const sair = () => {
        setModalVisible(true);
    };

    const confirmarSair = async () => {
        setModalVisible(false);
        await logout();
        router.replace('/');
    };

    if (authLoading) return null;

    return (
        <ImageBackground source={bg} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Quem vai jogar agora?</Text>
                    <Text style={styles.subtitle}>Selecione um perfil para começar</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#7C3AED" />
                    ) : (
                        <ScrollView contentContainerStyle={styles.profilesGrid} showsVerticalScrollIndicator={false}>
                            {perfis.map((perfil) => (
                                <TouchableOpacity
                                    key={perfil.id}
                                    style={styles.profileButton}
                                    onPress={() => entrarPerfil(perfil)}
                                >
                                    <View style={styles.avatarCircle}>
                                        <Text style={{ fontSize: 40 }}>
                                            {AVATARES_MAP[perfil.avatar] || '👤'}
                                        </Text>
                                    </View>
                                    <Text style={styles.profileName}>{perfil.nick}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.addProfileButton}
                                onPress={() => router.push('/cadastro-crianca')}
                            >
                                <View style={[styles.avatarCircle, styles.addCircle]}>
                                    <Text style={{ fontSize: 30, color: '#6B7280' }}>+</Text>
                                </View>
                                <Text style={styles.addText}>Novo Perfil</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={sair}
                >
                    <Text style={styles.logoutButtonText}>Sair da conta</Text>
                </TouchableOpacity>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Sair da conta</Text>
                            </View>
                            <Text style={styles.modalText}>Tem certeza que deseja sair da sua conta?</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.buttonCancel]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.buttonConfirm]}
                                    onPress={confirmarSair}
                                >
                                    <Text style={styles.buttonConfirmText}>Sair</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: {
        backgroundColor: '#FFF', width: '100%', borderRadius: 40, padding: 30,
        elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2, shadowRadius: 10,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#444', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 30, textAlign: 'center' },
    profilesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
    profileButton: { alignItems: 'center', width: 100 },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
        borderWidth: 3, borderColor: '#7C3AED', elevation: 5
    },
    profileName: { fontSize: 16, fontWeight: '700', color: '#374151', textAlign: 'center' },
    addProfileButton: { alignItems: 'center', width: 100 },
    addCircle: { borderColor: '#D1D5DB', borderStyle: 'dashed' },
    addText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    logoutButton: { marginTop: 12, backgroundColor: '#EF4444', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, elevation: 3 },
    logoutButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 25,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalHeader: {
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
    },
    modalText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        backgroundColor: '#F3F4F6',
    },
    buttonConfirm: {
        backgroundColor: '#EF4444',
    },
    buttonCancelText: {
        color: '#4B5563',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonConfirmText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});