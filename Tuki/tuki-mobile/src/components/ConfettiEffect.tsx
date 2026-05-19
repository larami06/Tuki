import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#00d2d3', '#54a0ff', '#5f27cd'];

interface ConfettiPieceProps {
  index: number;
}

const ConfettiPiece = ({ index }: ConfettiPieceProps) => {
  const size = Math.random() * 8 + 6; // 6px to 14px
  const startX = Math.random() * SCREEN_WIDTH;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const rotateStart = Math.random() * 360;

  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(rotateStart);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Queda
    translateY.value = withDelay(
      Math.random() * 1500,
      withTiming(SCREEN_HEIGHT + 20, {
        duration: Math.random() * 2500 + 2000,
        easing: Easing.linear,
      })
    );

    // Oscilação lateral
    translateX.value = withDelay(
      Math.random() * 1500,
      withTiming(startX + (Math.random() * 160 - 80), {
        duration: Math.random() * 2500 + 2000,
        easing: Easing.ease,
      })
    );

    // Rotação
    rotate.value = withDelay(
      Math.random() * 1500,
      withTiming(rotateStart + 720, {
        duration: Math.random() * 2500 + 2000,
        easing: Easing.linear,
      })
    );

    // Fade out no final
    opacity.value = withDelay(
      Math.random() * 1500 + 1500,
      withTiming(0, {
        duration: 1500,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        animatedStyle,
        {
          width: size,
          height: size * (Math.random() > 0.5 ? 1.5 : 1),
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
      ]}
    />
  );
};

export default function ConfettiEffect() {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    // Cria 80 confetes de uma vez
    setPieces(Array.from({ length: 80 }, (_, i) => i));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((id) => (
        <ConfettiPiece key={id} index={id} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
});
