import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ title: 'Tuki' }}>
        <Stack.Screen name="index" options={{ title: 'Tuki - Principal', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Tuki - Entrar' }} />
        <Stack.Screen name="cadastro" options={{ title: 'Tuki - Cadastro' }} />
        <Stack.Screen name="trilha-alfabetizacao" options={{ title: 'Tuki - Alfabetização' }} />
        <Stack.Screen name="trilha-matematica" options={{ title: 'Tuki - Matemática' }} />
        <Stack.Screen name="trilha-historias" options={{ title: 'Tuki - Histórias' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Aviso' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
