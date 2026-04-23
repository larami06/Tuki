const API_URL = 'http://192.168.18.40:5276';

export const criarUsuario = async (usuario: any) => {
    const response = await fetch(`${API_URL}/Usuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
    });

    if (!response.ok) {
        throw new Error("Erro ao criar usuário");
    }

    return response.json();
};