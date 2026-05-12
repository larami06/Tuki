import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import LandingScreen from '../src/screens/LandingScreen';
import { obterResponsavel } from '../src/services/storage';

export default function Index() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [estaLogado, setEstaLogado] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('--- DIAGNÓSTICO DE INÍCIO ---');
        try {
            const responsavel = await obterResponsavel();
            console.log('Responsável encontrado:', responsavel);

            if (responsavel) {
                console.log('Redirecionando para /home...');
                setEstaLogado(true);
                router.replace('/home');
            } else {
                console.log('Nenhum login encontrado. Mostrando LandingScreen.');
                setEstaLogado(false);
            }
        } catch (error) {
            console.error('Erro no checkAuth:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        // Mostra um carregando simples enquanto verifica o storage
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    // Se não estiver logado, mostra a Landing Screen
    // Se estiver logado, o router.replace acima já terá disparado, mas por segurança não renderizamos nada aqui
    return estaLogado ? null : <LandingScreen />;
}