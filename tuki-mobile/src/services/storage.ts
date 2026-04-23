import AsyncStorage from '@react-native-async-storage/async-storage';

export const salvarUsuario = async (usuario: any) => {
    await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
};

export const getUsuario = async () => {
    const data = await AsyncStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
};