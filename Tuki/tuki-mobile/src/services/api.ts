import Constants from 'expo-constants';

// Pega o IP do computador que está rodando o Metro Bundler automaticamente
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || 'localhost';
const API_URL = `http://${localhost}:5276`;

console.log('--- CONFIGURAÇÃO DE API ---');
console.log('Host detectado:', debuggerHost);
console.log('IP final:', localhost);
console.log('URL da API:', API_URL);
console.log('---------------------------');

export interface UsuarioCreateDto {
  nick: string;
  idade: number;
}

export interface UsuarioResponseDto {
  id: number;
  nick: string;
  idade: number;
}

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
