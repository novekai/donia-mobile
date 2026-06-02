// Donia — Reanimated 4 presets
// Reproduit les keyframes CSS du prototype (préfixe c-*) :
// c-float, c-float-slow, c-drift, c-spin-slow, c-spin-rev, c-twinkle,
// c-pulse, c-wiggle, c-bob, c-ring-grow, c-wave-x, c-shimmer, c-confetti
//
// Toutes les anims tournent sur le UI thread (worklets).

import { useEffect } from 'react';
import {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';

// ────────── c-float ──────────
// translateY 0 → -12 → 0 (7s ease-in-out infinite)
export function useFloat(opts: { distance?: number; duration?: number; delay?: number } = {}) {
  const { distance = 12, duration = 7000, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(v);
  }, [v, distance, duration, delay]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: v.value }] }));
}

// ────────── c-float-slow ──────────
export function useFloatSlow(opts: { distance?: number; delay?: number } = {}) {
  return useFloat({ ...opts, duration: 11000 });
}

// ────────── c-spin (linear infinite) ──────────
export function useSpin(opts: { duration?: number; reverse?: boolean; delay?: number } = {}) {
  const { duration = 60000, reverse = false, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(v);
  }, [v, duration, reverse, delay]);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${v.value}deg` }] }));
}

// ────────── c-twinkle ──────────
// opacity 0.25 → 1 + scale 0.85 → 1.1 (3s ease-in-out infinite)
export function useTwinkle(opts: { duration?: number; delay?: number } = {}) {
  const { duration = 3000, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(v);
  }, [v, duration, delay]);
  return useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 0.5, 1], [0.25, 1, 0.25]),
    transform: [{ scale: interpolate(v.value, [0, 0.5, 1], [0.85, 1.1, 0.85]) }],
  }));
}

// ────────── c-pulse ──────────
// scale 1 → 1.04 (3.2s ease-in-out infinite)
export function usePulse(opts: { intensity?: number; duration?: number; delay?: number } = {}) {
  const { intensity = 0.04, duration = 3200, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(v);
  }, [v, duration, delay]);
  return useAnimatedStyle(() => ({
    transform: [{ scale: 1 + v.value * intensity }],
  }));
}

// ────────── c-wiggle ──────────
// rotate -3deg ↔ +3deg (4s ease-in-out infinite, origin bottom)
export function useWiggle(opts: { amplitude?: number; duration?: number; delay?: number } = {}) {
  const { amplitude = 3, duration = 4000, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(v);
  }, [v, duration, delay]);
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(v.value, [0, 0.5, 1], [-amplitude, amplitude, -amplitude])}deg` }],
  }));
}

// ────────── c-bob ──────────
// translateY 0 ↔ -6 (4s ease-in-out infinite)
export function useBob(opts: { distance?: number; duration?: number; delay?: number } = {}) {
  const { distance = 6, duration = 4000, delay = 0 } = opts;
  return useFloat({ distance, duration, delay });
}

// ────────── c-ring-grow ──────────
// scale 0.6 → 1.4 + opacity 0.7 → 0 (2.6s ease-out infinite)
export function useRingGrow(opts: { duration?: number; delay?: number } = {}) {
  const { duration = 2600, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), -1, false),
    );
    return () => cancelAnimation(v);
  }, [v, duration, delay]);
  return useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 1], [0.7, 0]),
    transform: [{ scale: interpolate(v.value, [0, 1], [0.6, 1.4]) }],
  }));
}

// ────────── c-wave-x ──────────
export function useWaveX(opts: { distance?: number; duration?: number; delay?: number } = {}) {
  const { distance = 6, duration = 5000, delay = 0 } = opts;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(v);
  }, [v, distance, duration, delay]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: v.value }] }));
}

// ────────── Tap scale (Pressable wrapper) ──────────
// Press-in 0.96, press-out 1.0 — used on every CTA
export function useTapScale() {
  const v = useSharedValue(1);
  const onPressIn = () => { v.value = withTiming(0.96, { duration: 80 }); };
  const onPressOut = () => { v.value = withTiming(1, { duration: 120 }); };
  const style = useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));
  return { style, onPressIn, onPressOut };
}
