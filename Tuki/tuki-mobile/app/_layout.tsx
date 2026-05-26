import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Segura o splash screen nativo até o app estar pronto
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Esconde o splash nativo após o layout montar (nossa tela de loading customizada assume)
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >

        <Stack.Screen
          name="index"
          options={{
            title: 'Tuki - Principal',
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            title: 'Tuki - Entrar',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="cadastro"
          options={{
            title: 'Tuki - Cadastro',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="cadastro-crianca"
          options={{
            title: 'Tuki - Adicionar Criança',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="selecionar-perfil"
          options={{
            title: 'Tuki - Selecionar Perfil',
          }}
        />

        <Stack.Screen
          name="trilha-alfabetizacao"
          options={{
            title: 'Tuki - Alfabetização',
          }}
        />

        <Stack.Screen
          name="trilha-matematica"
          options={{
            title: 'Tuki - Matemática',
          }}
        />

        <Stack.Screen
          name="trilha-historias"
          options={{
            title: 'Tuki - Histórias',
          }}
        />

        <Stack.Screen
          name="familia-b-c"
          options={{
            title: 'Tuki - Família do B e C',
          }}
        />

        <Stack.Screen
          name="loja"
          options={{ title: 'Tuki - Loja' }}
        />

        <Stack.Screen
          name="inventario"
          options={{ title: 'Tuki - Inventário' }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Aviso',
          }}
        />

      </Stack>

      <StatusBar style="auto" />

    </ThemeProvider>
  );
}