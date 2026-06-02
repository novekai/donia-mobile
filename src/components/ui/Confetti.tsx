// Confetti — wrapper de react-native-confetti-cannon
// Auto-trigger sur mount (utilisé sur l'écran "Tu as reçu un cadeau")
// Couleurs : palette Donia (coral, mango, pink, mint, cream, indigo)
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors } from '../../theme/tokens';

type Props = {
  count?: number;
  autoStart?: boolean;
  fallSpeed?: number;
  fadeOut?: boolean;
  origin?: { x: number; y: number };
};

export function Confetti({
  count = 80,
  autoStart = true,
  fallSpeed = 3000,
  fadeOut = true,
  origin = { x: 200, y: -10 },
}: Props) {
  const ref = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (autoStart) {
      // Tiny delay so the screen has time to render before the burst
      const t = setTimeout(() => ref.current?.start(), 200);
      return () => clearTimeout(t);
    }
  }, [autoStart]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ConfettiCannon
        ref={ref}
        count={count}
        origin={origin}
        autoStart={false}
        fadeOut={fadeOut}
        fallSpeed={fallSpeed}
        colors={[...colors.confetti]}
      />
    </View>
  );
}
