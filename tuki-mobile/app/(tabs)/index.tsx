import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import bg from '../../assets/images/background.png';

export default function Home() {
  const router = useRouter();

  return (
    <ImageBackground
      source={bg}
      style={styles.background}
      resizeMode="cover"
      blurRadius={5}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo 👋</Text>

          <TouchableOpacity
            style={styles.buttonMain}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={styles.buttonMainText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonSecondaryText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 40,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 30,
    color: '#444',
  },

  buttonMain: {
    backgroundColor: '#7C3AED',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonMainText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },

  buttonSecondary: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },

  buttonSecondaryText: {
    color: '#7C3AED',
    fontSize: 18,
    fontWeight: '800',
  },
});