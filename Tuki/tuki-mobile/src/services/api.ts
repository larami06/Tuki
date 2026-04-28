// localhost:5276  →  testando no navegador (npm run web) ou emulador iOS
// 10.0.2.2:5276   →  emulador Android
// 192.168.x.x:5276 →  dispositivo físico (use o IP da sua máquina na rede)
const API_URL = 'http://localhost:5276';

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
