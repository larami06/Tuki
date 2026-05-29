import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface ExitConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ExitConfirmModal({ visible, onCancel, onConfirm }: ExitConfirmModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <AlertTriangle size={40} color="#ef4444" />
          </View>
          <Text style={styles.title}>Sair da Atividade?</Text>
          <Text style={styles.message}>
            Se você sair agora, perderá todo o seu progresso atual. Tem certeza?
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Ficar e Jogar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  box: { width: '100%', backgroundColor: '#fff', borderRadius: 32, padding: 30, alignItems: 'center', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#1f2937', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24, marginBottom: 28, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: '#f3f4f6', flex: 1.5 },
  btnConfirm: { backgroundColor: '#ef4444', flex: 1 },
  btnCancelText: { fontSize: 16, fontWeight: '800', color: '#374151' },
  btnConfirmText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
