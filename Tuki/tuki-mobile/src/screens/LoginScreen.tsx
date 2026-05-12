import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView
} from 'react-native';

import { useRouter } from 'expo-router';
import { loginResponsavel } from '../services/api';
import ibg from '../../assets/images/initbg.jpg';
import { salvarResponsavel } from '../services/storage';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');


  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  // abre teclado automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      emailRef.current?.focus();
    }, 300);

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
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>
                  Entrar
                </Text>
              </TouchableOpacity>

              {/* LINK CADASTRO */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/cadastro',
                    params: {
                      direction: 'forward'
                    }
                  })
                }
              >
                <Text style={styles.secondaryLink}>
                  Criar nova conta
                </Text>
              </TouchableOpacity>

            </View>

            {/* BOTÃO VOLTAR */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.backButtonText}>
                ← Voltar
              </Text>
            </TouchableOpacity>

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
    marginTop: 15,
  },

  error: {
    color: '#EF4444',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600'
  },


  backButton: {
    marginTop: 20,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
  },

  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});