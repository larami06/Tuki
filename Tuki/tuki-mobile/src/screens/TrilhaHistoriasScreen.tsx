import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Star, Lock, Book, Sparkles } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LEVELS = [
  { id: 1, title: 'O Pequeno Tuki', status: 'completed', icon: 'egg-easter', color: '#fbcfe8' },
  { id: 2, title: 'Reino das Cores', status: 'current', icon: 'palette', color: '#f9a8d4' },
  { id: 3, title: 'Amigos da Floresta', status: 'locked', icon: 'paw', color: '#f472b6' },
  { id: 4, title: 'Viagem ao Mar', status: 'locked', icon: 'waves', color: '#db2777' },
  { id: 5, title: 'Dragão Amigável', status: 'locked', icon: 'dragon', color: '#be185d' },
  { id: 6, title: 'Noite Estrelada', status: 'locked', icon: 'weather-night', color: '#9d174d' },
  { id: 7, title: 'Festa no Castelo', status: 'locked', icon: 'castle', color: '#831843' },
];

export default function TrilhaHistoriasScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Histórias</Text>
          <Text style={styles.subtitle}>Contos Mágicos ✨</Text>
        </View>
        <View style={styles.statsHeader}>
          <Book size={20} color="#fff" />
          <Text style={styles.statsText}>2/15</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.trailContainer}>
          {LEVELS.map((level, index) => {
            const isCenter = index % 3 === 0;
            const isLeft = index % 3 === 1;
            const isRight = index % 3 === 2;
            const isLocked = level.status === 'locked';
            const isCurrent = level.status === 'current';

            return (
              <View key={level.id} style={[
                styles.levelWrapper, 
                { alignSelf: isCenter ? 'center' : (isLeft ? 'flex-start' : 'flex-end') }
              ]}>
                <TouchableOpacity 
                  style={[
                    styles.levelButton, 
                    { backgroundColor: isLocked ? '#fce7f3' : level.color },
                    isCurrent && styles.currentLevel
                  ]}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <Lock size={24} color="#f9a8d4" />
                  ) : (
                    <MaterialCommunityIcons name={level.icon as any} size={42} color="#fff" />
                  )}
                  
                  {isCurrent && (
                    <View style={styles.sparkleBadge}>
                      <Sparkles size={16} color="#fbbf24" fill="#fbbf24" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, isLocked && styles.lockedText]}>
                    {level.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff1f2' },
  header: {
    backgroundColor: '#ec4899',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#fce7f3', fontSize: 14 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  scrollContent: { padding: 30, paddingBottom: 100 },
  trailContainer: {
    paddingHorizontal: 10,
  },
  levelWrapper: {
    marginBottom: 60,
    alignItems: 'center',
    width: '45%',
  },
  levelButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 6,
    borderColor: '#fff',
  },
  currentLevel: {
    transform: [{ scale: 1.1 }],
    borderColor: '#f472b6',
    borderStyle: 'dashed',
  },
  levelEmoji: { fontSize: 40 },
  sparkleBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  levelInfo: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 1,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9d174d',
    textAlign: 'center',
  },
  lockedText: { color: '#f9a8d4' },
});
