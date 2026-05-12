import Constants from 'expo-constants';

// Pega o IP do computador que está rodando o Metro Bundler automaticamente
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || 'localhost';
export const API_URL = `http://${localhost}:5276`;

console.log('--- CONFIGURAÇÃO DE API ---');
console.log('Host detectado:', debuggerHost);
console.log('IP final:', localhost);
console.log('URL da API:', API_URL);
console.log('---------------------------');

// INTERFACES
export interface UsuarioCreateDto {
  nick: string;
  idade: number;
  idResponsavel: number;
  avatar: string;
}

export interface UsuarioResponseDto {
  id: number;
  nick: string;
  idade: number;
  avatar: string;
  idResponsavel: number;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
}

export interface ResponsavelCreateDto {
  email: string;
  senha: string;
}

export interface ResponsavelResponseDto {
  id: number;
  email: string;
}

// FUNÇÕES DE USUÁRIO (CRIANÇA)
export const criarUsuario = async (usuario: UsuarioCreateDto): Promise<UsuarioResponseDto> => {
  const response = await fetch(`${API_URL}/api/Usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`Erro ${response.status}: ${texto}`);
  }

  return response.json();
};

export const buscarPerfisDoResponsavel = async (idResponsavel: number): Promise<UsuarioResponseDto[]> => {
  const response = await fetch(`${API_URL}/api/Usuarios/responsavel/${idResponsavel}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar perfis do responsável');
  }

  return response.json();
};

// FUNÇÕES DE RESPONSÁVEL (PAI/MÃE)
export const criarResponsavel = async (dados: ResponsavelCreateDto): Promise<ResponsavelResponseDto> => {
  const response = await fetch(`${API_URL}/api/Responsaveis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`Erro ${response.status}: ${texto}`);
  }

  return response.json();
};

export const loginResponsavel = async (email: string, senha: string): Promise<ResponsavelResponseDto> => {
  const response = await fetch(`${API_URL}/api/Responsaveis/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    throw new Error('Email ou senha inválidos.');
  }

  return response.json();
};