import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Animated,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { loginResponsavel } from '../services/api';
import ibg from '../../assets/images/background.jpg';
import { salvarResponsavel } from '../services/storage';

// Wrapper genérico para botões com animação de toque (escala e opacidade)
function AnimatedPressable({ onPress, style, children }: { onPress: () => void, style?: any, children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== 'web';

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver, speed: 30, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 0.7, duration: 80, useNativeDriver }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver, speed: 20, bounciness: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver }),
    ]).start();
  };

  const handlePress = () => {
    // Aguarda um instante para a animação ser percebida antes da navegação
    setTimeout(() => {
      onPress();
    }, 150);
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const backBtnStyle = StyleSheet.create({
  btn: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  txt: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  // Voltar: se veio do cadastro, volta para cadastro. Se veio de tela protegida (auth) ou landing, vai para a landing.
  const handleVoltar = () => {
    if (from === 'cadastro') {
      router.back();
    } else {
      router.replace({ pathname: '/', params: { skipIntro: 'true' } });
    }
  };

  const handleCriarNovaConta = () => {
    if (from === 'cadastro') {
      router.back();
    } else {
      router.push({ pathname: '/cadastro', params: { from: 'login' } });
    }
  };

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  // Animação de entrada do card
  const cardY   = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    // Slide up + fade in
    Animated.parallel([
      Animated.timing(cardY, {
        toValue: 0,
        duration: 420,
        useNativeDriver,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver,
      }),
    ]).start();

    // abre teclado automaticamente
    const timer = setTimeout(() => {
      emailRef.current?.focus();
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {

    try {

      setErro('');

      const resposta = await loginResponsavel(
        email,
        senha
      );

      await salvarResponsavel(resposta);

      router.replace('/selecionar-perfil');

    } catch (error) {

      setErro('Email ou senha inválidos.');

      console.error(error);
    }
  };

  return (
    <ImageBackground
      source={ibg}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={styles.overlay}
            onStartShouldSetResponder={() => {
              Keyboard.dismiss();
              return false;
            }}
          >

            {/* CARD + VOLTAR animados juntos */}
            <Animated.View
              style={{ opacity: cardFade, transform: [{ translateY: cardY }] }}
            >
              {/* CARD */}
              <View style={styles.card}>

                <Text style={styles.title}>Entrar</Text>

                <Text style={styles.subtitle}>
                  Faça login como responsável
                </Text>

                {/* EMAIL */}
                <Text style={styles.label}>Email</Text>

                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Ex: responsavel@email.com"
                  placeholderTextColor="#d1d5db"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => senhaRef.current?.focus()}
                />

                {/* SENHA */}
                <Text style={styles.label}>Senha</Text>

                <TextInput
                  ref={senhaRef}
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#d1d5db"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />

                {erro ? (
                  <Text style={styles.error}>
                    {erro}
                  </Text>
                ) : null}

                {/* BOTÃO LOGIN */}
                <AnimatedPressable style={styles.primaryButton} onPress={handleLogin}>
                  <Text style={styles.buttonText}>
                    Entrar
                  </Text>
                </AnimatedPressable>

                {/* LINK CADASTRO */}
                <AnimatedPressable style={{ marginTop: 15 }} onPress={handleCriarNovaConta}>
                  <Text style={styles.secondaryLink}>
                    Criar nova conta
                  </Text>
                </AnimatedPressable>

              </View>

              <AnimatedPressable style={backBtnStyle.btn} onPress={() => router.back()}>
                <Text style={backBtnStyle.txt}>← Voltar</Text>
              </AnimatedPressable>
            </Animated.View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 40,
    padding: 30,

    elevation: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#444',
    marginBottom: 10,
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 25,
    textAlign: 'center'
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginLeft: 5
  },

  input: {
    backgroundColor: '#FFF9F0',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0EAD6'
  },

  primaryButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800'
  },

  secondaryLink: {
    color: '#7C3AED',
    fontWeight: '700',
    textAlign: 'center',
  },

  error: {
    color: '#EF4444',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600'
  },


  backButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  backButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});