// Shimmer — overlay gradient sweep horizontal (3.5s linear infinite)
// Reproduit le c-shimmer du prototype (utilisé sur les CTA primary + balance card)
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  style?: StyleProp<ViewStyle>;
  duration?: number;
  highlightColor?: string;
};

export function Shimmer({ style, duration = 3500, highlightColor = 'rgba(255,255,255,0.5)' }: Props) {
  const v = useSharedValue(-1);
  const [w, setW] = React.useState(200);

  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(v);
  }, [v, duration]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: v.value * w }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View pointerEvents="none" onLayout={onLayout} style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', highlightColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
