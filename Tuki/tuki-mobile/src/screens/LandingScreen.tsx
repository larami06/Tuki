import React, { useRef } from 'react';
import { View, Text, Animated, Pressable, ImageBackground, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import ibg from '../../assets/images/initbg.jpg';

// Botão com animação de press (scale spring + fade)
function AnimatedButton({
    style,
    textStyle,
    label,
    onPress,
}: {
    style: object;
    textStyle: object;
    label: string;
    onPress: () => void;
}) {
    const scale   = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const useNativeDriver = Platform.OS !== 'web';

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.92, useNativeDriver, speed: 30, bounciness: 6 }),
            Animated.timing(opacity, { toValue: 0.75, duration: 80, useNativeDriver }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver, speed: 20, bounciness: 10 }),
            Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver }),
        ]).start();
    };

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1 }}>
            <Animated.View style={[styles.button, style, { transform: [{ scale }], opacity }]}>
                <Text style={[styles.buttonText, textStyle]}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
}

export default function LandingScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={ibg}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <AnimatedButton
                        style={styles.buttonLight}
                        textStyle={styles.buttonTextDark}
                        label="Cadastrar"
                        onPress={() => router.push('/cadastro')}
                    />
                    <AnimatedButton
                        style={styles.buttonPurple}
                        textStyle={styles.buttonTextLight}
                        label="Entrar"
                        onPress={() => router.push('/login')}
                    />
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
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
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
});
