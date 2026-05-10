import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { criarUsuario } from '../services/api';
import ibg from '../../assets/images/initbg.jpg';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={ibg}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.footer}>
        {/* BOTÃO DEV - PEQUENO PARA TESTES */}
        <TouchableOpacity
          style={styles.devButton}
          onPress={async () => {
            try {
              await criarUsuario({
                nick: "DevUser",
                idade: 10,
                idResponsavel: 1,
                avatar: "avatar_1"
              });
              router.push('/home');
            } catch (error) {
              console.log("Erro no DevLogin (já deve existir ou erro de conexão):", error);
              router.push('/home');
            }
          }}
        >
          <Text style={styles.devButtonText}>Dev Login (Mock)</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonLight]}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={[styles.buttonText, styles.buttonTextDark]}>
              Cadastrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPurple]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.buttonText, styles.buttonTextLight]}>
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonLight: {
    backgroundColor: '#ffffff',
  },
  buttonPurple: {
    backgroundColor: '#7c3aed',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDark: {
    color: '#1f2937',
  },
  buttonTextLight: {
    color: '#ffffff',
  },
  devButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  devButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
