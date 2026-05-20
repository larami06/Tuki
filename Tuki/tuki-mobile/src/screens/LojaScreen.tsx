import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, Modal, ActivityIndicator, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Coins, Home as HomeIcon, Book, User, X } from 'lucide-react-native';
import {
  buscarRecompensas, buscarRecompensasDoUsuario, comprarRecompensa,
  buscarUsuarioPorId, RecompensaDto
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

export default function LojaScreen() {
  const router = useRouter();
  const [moedas, setMoedas] = useState(0);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [itens, setItens] = useState<RecompensaDto[]>([]);
  const [adquiridos, setAdquiridos] = useState<number[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [comprando, setComprando] = useState<number | null>(null);
  const [modal, setModal] = useState<{ visivel: boolean; mensagem: string; sucesso: boolean }>({
    visivel: false, mensagem: '', sucesso: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const perfil = await obterPerfilAtivo();
      if (!perfil) return;
      setIdUsuario(perfil.id);
      setMoedas(perfil.moedas || 0);

      const [todosItens, itensAdquiridos, perfilAtualizado] = await Promise.all([
        buscarRecompensas(),
        buscarRecompensasDoUsuario(perfil.id),
        buscarUsuarioPorId(perfil.id),
      ]);

      const filtrados = todosItens.filter(i => i.tipo === 'avatar' || i.tipo === 'fundo');
      const vistos = new Set<string>();
      const semDuplicatas = filtrados.filter(i => {
        if (vistos.has(i.identificador)) return false;
        vistos.add(i.identificador);
        return true;
      });
      setItens(semDuplicatas);
      setAdquiridos(itensAdquiridos.map(i => i.id));
      setMoedas(perfilAtualizado.moedas || 0);
    } catch (e) {
      console.error('Erro ao carregar loja:', e);
    } finally {
      setCarregando(false);
    }
  };

  const comprar = async (item: RecompensaDto) => {
    if (!idUsuario) return;
    setComprando(item.id);
    try {
      playSound('click');
      const inventarioAtualizado = await comprarRecompensa(idUsuario, item.id);
      setMoedas(inventarioAtualizado.moedas);
      setAdquiridos(prev => [...prev, item.id]);

      const perfilAtual = await obterPerfilAtivo();
      if (perfilAtual) {
        await salvarPerfilAtivo({ ...perfilAtual, moedas: inventarioAtualizado.moedas });
      }

      setModal({ visivel: true, mensagem: `${item.nome} adquirido com sucesso! 🎉`, sucesso: true });
    } catch (e: any) {
      const msg = e?.message || 'Erro ao comprar item.';
      if (msg.includes('insuficientes')) {
        setModal({ visivel: true, mensagem: 'Moedas insuficientes! Continue jogando para ganhar mais. 🪙', sucesso: false });
      } else if (msg.includes('adquirido')) {
        setModal({ visivel: true, mensagem: 'Você já possui este item!', sucesso: false });
      } else {
        setModal({ visivel: true, mensagem: msg, sucesso: false });
      }
    } finally {
      setComprando(null);
    }
  };

  const avatares = itens.filter(i => i.tipo === 'avatar');
  const fundos = itens.filter(i => i.tipo === 'fundo');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ShoppingBag size={28} color="#fff" />
          <Text style={styles.headerTitle}>Loja</Text>
        </View>
        <View style={styles.moedasBadge}>
          <Coins size={18} color="#EAB308" />
          <Text style={styles.moedasText}>{moedas}</Text>
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Seção Avatares */}
          <Text style={styles.sectionTitle}>🧑 Avatares</Text>
          <View style={styles.grid}>
            {avatares.map(item => {
              const jaAdquirido = adquiridos.includes(item.id);
              return (
                <View key={item.id} style={styles.card}>
                  <Image source={AVATARES_MAP[item.identificador]} style={styles.avatarImg} />
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  {jaAdquirido ? (
                    <View style={styles.adquiridoBadge}>
                      <Text style={styles.adquiridoText}>✓ Adquirido</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.comprarBtn}
                      onPress={() => comprar(item)}
                      disabled={comprando === item.id}
                    >
                      {comprando === item.id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : (
                          <View style={styles.btnRow}>
                            <Coins size={14} color="#fff" />
                            <Text style={styles.comprarText}>{item.valor}</Text>
                          </View>
                        )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Seção Fundos */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🎨 Fundos de Perfil</Text>
          <View style={styles.grid}>
            {fundos.map(item => {
              const jaAdquirido = adquiridos.includes(item.id);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={[styles.fundoPreview, { backgroundColor: item.identificador }]} />
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  {jaAdquirido ? (
                    <View style={styles.adquiridoBadge}>
                      <Text style={styles.adquiridoText}>✓ Adquirido</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.comprarBtn}
                      onPress={() => comprar(item)}
                      disabled={comprando === item.id}
                    >
                      {comprando === item.id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : (
                          <View style={styles.btnRow}>
                            <Coins size={14} color="#fff" />
                            <Text style={styles.comprarText}>{item.valor}</Text>
                          </View>
                        )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Modal de feedback */}
      <Modal transparent animationType="fade" visible={modal.visivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModal(m => ({ ...m, visivel: false }))}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalEmoji}>{modal.sucesso ? '🎉' : '😢'}</Text>
            <Text style={[styles.modalMsg, { color: modal.sucesso ? '#10b981' : '#ef4444' }]}>
              {modal.mensagem}
            </Text>
            {modal.sucesso && (
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { setModal(m => ({ ...m, visivel: false })); router.push('/inventario' as any); }}
              >
                <Text style={styles.modalBtnText}>Ver Inventário</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* NavBar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/home'); }}>
          <HomeIcon size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/atividades'); }}>
          <Book size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ShoppingBag size={24} color="#7c3aed" />
          <Text style={[styles.navLabel, { color: '#7c3aed', fontWeight: 'bold' }]}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { playSound('click'); router.push('/perfil'); }}>
          <User size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  moedasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  moedasText: { fontSize: 16, fontWeight: '900', color: '#854D0E' },
  scroll: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1f2937', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatarImg: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  fundoPreview: {
    width: 72, height: 72, borderRadius: 16, marginBottom: 10,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)'
  },
  itemNome: { fontSize: 13, fontWeight: '700', color: '#374151', textAlign: 'center', marginBottom: 10 },
  comprarBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 70,
    alignItems: 'center',
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  comprarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  adquiridoBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  adquiridoText: { color: '#065f46', fontWeight: '800', fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    width: '80%', alignItems: 'center',
    elevation: 10,
  },
  modalClose: { position: 'absolute', top: 12, right: 12 },
  modalEmoji: { fontSize: 52, marginBottom: 12 },
  modalMsg: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  modalBtn: {
    backgroundColor: '#7c3aed', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 16,
  },
  modalBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1, borderColor: '#F3F4F6',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 10,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  navLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: '700' },
});
