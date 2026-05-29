import Constants from 'expo-constants';

// Pega o IP do computador que está rodando o Metro Bundler automaticamente
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || 'localhost';
export const API_URL = `http://${localhost}:5276`;


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
  tema: string;
  idResponsavel: number;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
  xp: number;
}

export interface UsuarioUpdateDto {
  avatar?: string;
  tema?: string;
}

export interface RecompensaDto {
  id: number;
  tipo: string;
  valor: number;
  nome: string;
  identificador: string;
}

export interface InventarioResponseDto {
  idInventario: number;
  idUsuario: number;
  moedas: number;
  estrelas: number;
  licoesConcluidas: number;
  streakAtual: number;
  xp: number;
}

export interface ResponsavelCreateDto {
  email: string;
  senha: string;
}

export interface ResponsavelResponseDto {
  id: number;
  email: string;
}

export interface ProgressoResponseDto {
  id: number;
  idUsuario: number;
  idLicao: number;
  pontuacao: number;
  tentativas: number;
  tempoResposta: number;
  concluida: boolean;
  materia: string;
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

  return response.json() as Promise<UsuarioResponseDto>;
};

export const buscarUsuarioPorId = async (id: number): Promise<UsuarioResponseDto> => {
  const response = await fetch(`${API_URL}/api/Usuarios/${id}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar usuário por ID');
  }

  return response.json() as Promise<UsuarioResponseDto>;
};

export const buscarPerfisDoResponsavel = async (idResponsavel: number): Promise<UsuarioResponseDto[]> => {
  const response = await fetch(`${API_URL}/api/Usuarios/responsavel/${idResponsavel}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar perfis do responsável');
  }

  return response.json() as Promise<UsuarioResponseDto[]>;
};

// FUNÇÕES DE PROGRESSO
export interface ProgressoCreateDto {
  idUsuario: number;
  idLicao: number;
  pontuacao?: number;
  tentativas: number;
  tempoResposta?: number;
  concluida: boolean;
}

export const registrarProgresso = async (dto: ProgressoCreateDto): Promise<ProgressoResponseDto> => {
  const response = await fetch(`${API_URL}/api/Progressos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`Erro ${response.status}: ${texto}`);
  }

  return response.json() as Promise<ProgressoResponseDto>;
};

export const buscarProgressoDoUsuario = async (idUsuario: number): Promise<ProgressoResponseDto[]> => {
  const response = await fetch(`${API_URL}/api/Progressos/usuario/${idUsuario}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar progresso do usuário');
  }

  return response.json() as Promise<ProgressoResponseDto[]>;
};

export const atualizarUsuario = async (id: number, dto: UsuarioUpdateDto): Promise<UsuarioResponseDto> => {
  const response = await fetch(`${API_URL}/api/Usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) throw new Error('Erro ao atualizar usuário');
  return response.json() as Promise<UsuarioResponseDto>;
};

export const buscarRecompensas = async (): Promise<RecompensaDto[]> => {
  const response = await fetch(`${API_URL}/api/Recompensas`);
  if (!response.ok) throw new Error('Erro ao buscar recompensas');
  return response.json() as Promise<RecompensaDto[]>;
};

export const buscarRecompensasDoUsuario = async (idUsuario: number): Promise<RecompensaDto[]> => {
  const response = await fetch(`${API_URL}/api/Usuarios/${idUsuario}/recompensas`);
  if (!response.ok) throw new Error('Erro ao buscar recompensas do usuário');
  return response.json() as Promise<RecompensaDto[]>;
};

export const comprarRecompensa = async (idUsuario: number, idRecompensa: number): Promise<InventarioResponseDto> => {
  const response = await fetch(`${API_URL}/api/Inventarios/usuario/${idUsuario}/comprar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idRecompensa }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro desconhecido' })) as { message?: string };
    throw new Error(body.message || 'Erro ao comprar item');
  }
  return response.json() as Promise<InventarioResponseDto>;
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

  return response.json() as Promise<ResponsavelResponseDto>;
};

export const atualizarInventario = async (idUsuario: number, moedas: number, estrelas: number, xp: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/Inventarios/usuario/${idUsuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moedas, estrelas, xp }),
  });
  if (!response.ok) throw new Error('Erro ao atualizar inventário');
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

  return response.json() as Promise<ResponsavelResponseDto>;
};