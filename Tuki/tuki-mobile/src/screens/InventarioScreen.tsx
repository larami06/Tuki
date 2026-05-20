import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Platform, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import {
  buscarRecompensasDoUsuario, atualizarUsuario, RecompensaDto
} from '../services/api';
import { obterPerfilAtivo, salvarPerfilAtivo } from '../services/storage';
import { playSound } from '../services/sound';

const AVATARES_MAP: Record<string, any> = {
  avatar_1: require('../../assets/images/avatar_1.jpg'),
  avatar_2: require('../../assets/images/avatar_2.jpg'),
  avatar_3: require('../../assets/images/avatar_3.jpg'),
  avatar_4: require('../../assets/images/avatar_4.jpg'),
  avatar_5: require('../../assets/images/avatar_5.jpg'),
};

export default function InventarioScreen() {
  const router = useRouter();
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [avatarAtual, setAvatarAtual] = useState('avatar_1');
  const [temaAtual, setTemaAtual] = useState('#7c3aed');
  const [itens, setItens] = useState<RecompensaDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [equipando, setEquipando] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const perfil = await obterPerfilAtivo();
      if (!perfil) return;
      setIdUsuario(perfil.id);
      setAvatarAtual(perfil.avatar || 'avatar_1');
      setTemaAtual((perfil as any).tema || '#7c3aed');

      const recompensas = await buscarRecompensasDoUsuario(perfil.id);
      setItens(recompensas);
    } catch (e) {
      console.error('Erro ao carregar inventário:', e);
    } finally {
      setCarregando(false);
    }
  };

  const equipar = async (item: RecompensaDto) => {
    if (!idUsuario) return;
    setEquipando(item.id);
    try {
      playSound('click');
      const dto = item.tipo === 'avatar'
        ? { avatar: item.identificador, tema: temaAtual }
        : { tema: item.identificador, avatar: avatarAtual };

      await atualizarUsuario(idUsuario, dto);

      const perfilAtual = await obterPerfilAtivo();
      if (perfilAtual) {
        await salvarPerfilAtivo({ ...perfilAtual, ...dto });
      }

      if (item.tipo === 'avatar') setAvatarAtual(item.identificador);
      else setTemaAtual(item.identificador);

      Alert.alert('Equipado!', `${item.nome} foi equipado com sucesso! ✨`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível equipar o item.');
    } finally {
      setEquipando(null);
    }
  };

  const avatares = itens.filter(i => i.tipo === 'avatar');
  const fundos = itens.filter(i => i.tipo === 'fundo');

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: temaAtual }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Inventário</Text>
        <View style={{ width: 40 }} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />
      ) : itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vaziоEmoji}>🛍️</Text>
          <Text style={styles.vazioTitulo}>Inventário vazio</Text>
          <Text style={styles.vazioSub}>Visite a loja para comprar avatares e fundos!</Text>
          <TouchableOpacity style={[styles.lojaBtn, { backgroundColor: temaAtual }]} onPress={() => router.push('/loja' as any)}>
            <Text style={styles.lojaBtnText}>Ir para a Loja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>

          {avatares.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🧑 Avatares</Text>
              <View style={styles.grid}>
                {avatares.map(item => {
                  const ativo = avatarAtual === item.identificador;
                  return (
                    <View key={item.id} style={[styles.card, ativo && styles.cardAtivo]}>
                      {ativo && (
                        <View style={styles.ativoBadge}>
                          <CheckCircle size={16} color="#7c3aed" />
                          <Text style={styles.ativoText}>Atual</Text>
                        </View>
                      )}
                      <Image source={AVATARES_MAP[item.identificador]} style={styles.avatarImg} />
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      {!ativo && (
                        <TouchableOpacity
                          style={[styles.equiparBtn, { backgroundColor: temaAtual }]}
                          onPress={() => equipar(item)}
                          disabled={equipando === item.id}
                        >
                          {equipando === item.id
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={styles.equiparText}>Equipar</Text>}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {fundos.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🎨 Fundos de Perfil</Text>
              <View style={styles.grid}>
                {fundos.map(item => {
                  const ativo = temaAtual === item.identificador;
                  return (
                    <View key={item.id} style={[styles.card, ativo && styles.cardAtivo]}>
                      {ativo && (
                        <View style={styles.ativoBadge}>
                          <CheckCircle size={16} color="#7c3aed" />
                          <Text style={styles.ativoText}>Atual</Text>
                        </View>
                      )}
                      <View style={[styles.fundoPreview, { backgroundColor: item.identificador }]} />
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      {!ativo && (
                        <TouchableOpacity
                          style={[styles.equiparBtn, { backgroundColor: temaAtual }]}
                          onPress={() => equipar(item)}
                          disabled={equipando === item.id}
                        >
                          {equipando === item.id
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={styles.equiparText}>Equipar</Text>}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1f2937', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '46%', backgroundColor: '#fff', borderRadius: 20,
    padding: 14, alignItems: 'center',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
    position: 'relative',
  },
  cardAtivo: { borderWidth: 2, borderColor: '#7c3aed' },
  ativoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  ativoText: { fontSize: 11, fontWeight: '800', color: '#7c3aed' },
  avatarImg: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  fundoPreview: {
    width: 72, height: 72, borderRadius: 16, marginBottom: 10,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)'
  },
  itemNome: { fontSize: 13, fontWeight: '700', color: '#374151', textAlign: 'center', marginBottom: 10 },
  equiparBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14,
    minWidth: 80, alignItems: 'center',
  },
  equiparText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  vaziоEmoji: { fontSize: 64, marginBottom: 16 },
  vazioTitulo: { fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 8 },
  vazioSub: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  lojaBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 18 },
  lojaBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
