import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Rocket } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, Easing, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../services/sound';
import { useGameCompletion } from '../hooks/useGameCompletion';
import GameCompletionModal from '../components/GameCompletionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHALLENGES = [
    { id: 1, type: 'MAIOR', values: [3, 8, 5], answer: 8 },
    { id: 2, type: 'MENOR', values: [10, 2, 7], answer: 2 },
    { id: 3, type: 'MAIOR', values: [12, 25, 15], answer: 25 },
    { id: 4, type: 'MENOR', values: [9, 14, 6], answer: 6 }
];

export default function MaiorOuMenorScreen() {
    const router = useRouter();
    const { completionState, completeGame } = useGameCompletion(34);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [disabled, setDisabled] = useState(false);
    
    const challenge = CHALLENGES[currentIndex];

    useEffect(() => {
        if (isFinished) {
            completeGame(CHALLENGES.length, CHALLENGES.length);
        }
    }, [isFinished]);

    const handleSelect = (val: number, onSuccess: () => void, onError: () => void) => {
        if (disabled) return;
        setDisabled(true);
        if (val === challenge.answer) {
            playSound('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSuccess();
            setTimeout(() => {
                if (currentIndex < CHALLENGES.length - 1) {
                    setCurrentIndex(i => i + 1);
                    setDisabled(false);
                } else {
                    setIsFinished(true);
                }
            }, 1200);
        } else {
            playSound('wrong');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            onError();
            setTimeout(() => { setDisabled(false); }, 800);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { playSound('click'); router.back(); }} style={styles.backButton}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Maior ou Menor?</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{currentIndex + 1}/{CHALLENGES.length}</Text>
                </View>
            </View>

            {challenge && (
                <View style={styles.gameArea}>
                    <Animated.Text entering={ZoomIn} key={`title-${currentIndex}`} style={styles.instructionText}>
                        Toque no foguete {challenge.type}!
                    </Animated.Text>

                    <View style={styles.rocketsRow}>
                        {challenge.values.map((val) => (
                            <RocketItem key={`${currentIndex}-${val}`} value={val} onSelect={handleSelect} />
                        ))}
                    </View>
                </View>
            )}
            {completionState && (
                <GameCompletionModal state={completionState} onContinue={() => router.back()} />
            )}
        </SafeAreaView>
    );
}

function RocketItem({ value, onSelect }: any) {
    const y = useSharedValue(0);
    const shake = useSharedValue(0);
    const scale = useSharedValue(1);
    
    // Scale rocket based on value. Range ~40 to 100
    const size = Math.max(50, Math.min(110, 40 + value * 3));

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: y.value },
            { translateX: shake.value },
            { scale: scale.value }
        ]
    }));

    const handlePress = () => {
        scale.value = withSequence(withSpring(0.9), withSpring(1));
        onSelect(
            value,
            // Success: fly up
            () => { y.value = withTiming(-SCREEN_HEIGHT, { duration: 800, easing: Easing.in(Easing.cubic) }); },
            // Error: shake
            () => { 
                shake.value = withSequence(
                    withTiming(-10, {duration:50}), withTiming(10, {duration:50}),
                    withTiming(-10, {duration:50}), withTiming(10, {duration:50}),
                    withSpring(0)
                );
            }
        );
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={handlePress}>
            <Animated.View style={[styles.rocketWrapper, animStyle]}>
                <Text style={styles.rocketValue}>{value}</Text>
                <Rocket size={size} color="#fcd34d" fill="#fcd34d" />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    header: { padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
    progressContainer: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    progressText: { color: '#fcd34d', fontWeight: 'bold', fontSize: 16 },
    
    gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    instructionText: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 80, textTransform: 'uppercase', textAlign: 'center', textShadowColor: '#4f46e5', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
    rocketsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 10 },
    rocketWrapper: { alignItems: 'center', marginHorizontal: 10 },
    rocketValue: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 15 },

    finishedSafeArea: { flex: 1, backgroundColor: '#1e1b4b' },
    finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    finishedMascot: { width: '70%', height: Dimensions.get('window').height * 0.32, marginBottom: 20 },
    finishedTitle: { fontSize: 38, fontWeight: '900', color: '#fcd34d', marginBottom: 10, textAlign: 'center' },
    finishedSubtitle: { fontSize: 20, color: '#94a3b8', marginBottom: 40, textAlign: 'center', lineHeight: 28 },
    backButtonLarge: { backgroundColor: '#4f46e5', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30 },
    backButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
