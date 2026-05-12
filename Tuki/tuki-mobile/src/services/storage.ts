import AsyncStorage from '@react-native-async-storage/async-storage';

export const salvarUsuario = async (usuario: any) => {
    await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
};

export const buscarUsuario = async () => {
    const data = await AsyncStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
};


const CHAVE_RESPONSAVEL = '@tuki_responsavel';

export async function salvarResponsavel(responsavel: any) {
    try {
        await AsyncStorage.setItem(
            CHAVE_RESPONSAVEL,
            JSON.stringify(responsavel)
        );
    } catch (error) {
        console.error('Erro ao salvar responsável:', error);
    }
}

export async function obterResponsavel() {
    try {
        const dados = await AsyncStorage.getItem(CHAVE_RESPONSAVEL);

        if (!dados) {
            return null;
        }

        return JSON.parse(dados);

    } catch (error) {
        console.error('Erro ao obter responsável:', error);
        return null;
    }
}


// PERFIL ATIVO (CRIANÇA SELECIONADA)
const CHAVE_PERFIL = '@tuki_perfil_ativo';

export async function salvarPerfilAtivo(perfil: any) {
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
}

export async function obterPerfilAtivo() {
    const dados = await AsyncStorage.getItem(CHAVE_PERFIL);
    return dados ? JSON.parse(dados) : null;
}

// LOGOUT
export async function logout() {
    try {
        await AsyncStorage.removeItem(CHAVE_RESPONSAVEL);
        await AsyncStorage.removeItem(CHAVE_PERFIL);
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}