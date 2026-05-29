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

// PROGRESSO ALFABETIZACAO
const CHAVE_PROGRESSO_ALFABETIZACAO = '@tuki_progresso_alfa';

export async function salvarAtividadeConcluida(atividadeId: number) {
    try {
        const perfil = await obterPerfilAtivo();
        const perfilId = perfil ? perfil.id : 'default';
        const key = `${CHAVE_PROGRESSO_ALFABETIZACAO}_${perfilId}`;
        
        const dados = await AsyncStorage.getItem(key);
        let concluidas = dados ? JSON.parse(dados) : [];
        
        if (!concluidas.includes(atividadeId)) {
            concluidas.push(atividadeId);
            await AsyncStorage.setItem(key, JSON.stringify(concluidas));
        }
    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
    }
}

// DESAFIO DO DIA — controla o limite de uma jogada por dia por criança
const CHAVE_ULTIMO_DESAFIO = '@tuki_ultimo_desafio';

export async function salvarUltimoDesafio(idUsuario: number): Promise<void> {
    const key = `${CHAVE_ULTIMO_DESAFIO}_${idUsuario}`;
    await AsyncStorage.setItem(key, new Date().toDateString());
}

export async function verificarJogouHoje(idUsuario: number): Promise<boolean> {
    const key = `${CHAVE_ULTIMO_DESAFIO}_${idUsuario}`;
    const data = await AsyncStorage.getItem(key);
    return data === new Date().toDateString();
}

// ─── DIAMANTES (moeda premium, raros) ─────────────────────────────────────────
const CHAVE_DIAMANTES = '@tuki_diamantes';
const CHAVE_RUBIS_LEGADO = '@tuki_rubis'; // chave antiga — migração transparente

export async function obterDiamantes(idUsuario: number): Promise<number> {
    const key = `${CHAVE_DIAMANTES}_${idUsuario}`;
    const val = await AsyncStorage.getItem(key);

    if (val !== null) {
        return parseInt(val, 10);
    }

    // Migração transparente: verifica se existe saldo na chave antiga (rubi)
    const keyLegado = `${CHAVE_RUBIS_LEGADO}_${idUsuario}`;
    const valLegado = await AsyncStorage.getItem(keyLegado);
    if (valLegado !== null) {
        const saldoMigrado = parseInt(valLegado, 10);
        // Salva na nova chave e remove a antiga
        await AsyncStorage.setItem(key, String(saldoMigrado));
        await AsyncStorage.removeItem(keyLegado);
        return saldoMigrado;
    }

    return 0;
}

export async function adicionarDiamantes(idUsuario: number, quantidade: number): Promise<number> {
    const key = `${CHAVE_DIAMANTES}_${idUsuario}`;
    const atual = await obterDiamantes(idUsuario);
    const novo = atual + quantidade;
    await AsyncStorage.setItem(key, String(novo));
    return novo;
}

// ─── STREAK ────────────────────────────────────────────────────────────────────
export interface StreakInfo {
    streakNovo: number;
    subiu: boolean;
    resetou: boolean;
}

export async function atualizarStreak(idUsuario: number): Promise<StreakInfo> {
    const keyDia    = `@tuki_ultimo_jogo_${idUsuario}`;
    const keyStreak = `@tuki_streak_${idUsuario}`;

    const hoje  = new Date().toDateString();
    const ontem = new Date(Date.now() - 86_400_000).toDateString();

    const ultimoDia  = await AsyncStorage.getItem(keyDia);
    const streakAtual = parseInt((await AsyncStorage.getItem(keyStreak)) || '0', 10);

    if (ultimoDia === hoje) {
        // Já jogou hoje — streak não muda
        return { streakNovo: streakAtual, subiu: false, resetou: false };
    }

    let novoStreak: number;
    let resetou = false;

    if (ultimoDia === ontem) {
        novoStreak = streakAtual + 1;
    } else {
        novoStreak = 1;
        resetou = ultimoDia !== null; // só "resetou" se havia streak anterior
    }

    await AsyncStorage.setItem(keyDia,    hoje);
    await AsyncStorage.setItem(keyStreak, String(novoStreak));

    return { streakNovo: novoStreak, subiu: true, resetou };
}

// Leitura do streak atual sem modificá-lo (para exibição no HUD)
export async function obterStreakAtual(idUsuario: number): Promise<number> {
    const keyStreak = `@tuki_streak_${idUsuario}`;
    return parseInt((await AsyncStorage.getItem(keyStreak)) || '0', 10);
}

export async function obterAtividadesConcluidas() {
    try {
        const perfil = await obterPerfilAtivo();
        const perfilId = perfil ? perfil.id : 'default';
        const key = `${CHAVE_PROGRESSO_ALFABETIZACAO}_${perfilId}`;
        
        const dados = await AsyncStorage.getItem(key);
        return dados ? JSON.parse(dados) : [];
    } catch (error) {
        console.error('Erro ao obter progresso:', error);
        return [];
    }
}