import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { obterResponsavel } from '../../src/services/storage';

export function useAuth() {

    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        verificarLogin();

    }, []);

    const verificarLogin = async () => {

        const responsavel = await obterResponsavel();

        if (!responsavel) {

            router.replace('/login');

            return;
        }

        setLoading(false);
    };

    return {
        loading
    };
}