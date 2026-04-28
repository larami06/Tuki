import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';

import ibg from '../assets/images/initbg.jpg';

export default function LoginScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Abre o teclado automaticamente após a tela carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300); // Pequeno delay garante que a transição de tela termine
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    if (nome.trim()) {
      router.push({ pathname: '/home', params: { nome } });
    }
  };

  return (
    <ImageBackground source={ibg} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.card}>
            <Text style={styles.title}>Entrar</Text>

            <Text style={styles.label}>Nome da criança</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ex: Joãozinho"
              placeholderTextColor="#d1d5db"
              value={nome}
              onChangeText={setNome}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={styles.secondaryLink}>Criar novo perfil</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  // ... mantenha os outros estilos (title, label, input, buttons) conforme você já tinha
  title: { fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 25 },
  label: { alignSelf: 'flex-start', marginBottom: 8, fontWeight: '600', color: '#374151' },
  input: {
    width: '100%',
    backgroundColor: '#fefcf0',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryLink: { color: '#7c3aed', fontWeight: '600' },
  backButton: { marginTop: 30 },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});