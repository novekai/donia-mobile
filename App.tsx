// Donia — App entry
// Charge les fonts, monte SafeAreaProvider + GestureHandlerRootView + QueryClient,
// et délègue toute la nav au RootNavigator.
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';

import { colors } from './src/theme/tokens';
import { fontMap } from './src/theme/typography';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/lib/queryClient';
import { useAuthStore } from './src/store/auth';
import { registerForPushNotificationsAsync } from './src/lib/pushTokens';
import { attachPushResponseListeners } from './src/lib/pushRouter';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const [forceReady, setForceReady] = useState(false);

  // Register Expo push token when logged in (best-effort, non-blocking)
  useEffect(() => {
    if (token) {
      registerForPushNotificationsAsync().catch(() => {});
    }
  }, [token]);

  // Wire push-notification taps to navigation (works in foreground, background, and cold start).
  useEffect(() => attachPushResponseListeners(), []);

  // Failsafe : si zustand n'a pas notifié l'hydratation au bout de 2s, on force.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAuthStore.getState().hydrated) {
        useAuthStore.getState().setHydrated();
      }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // Failsafe global : après 5s, on rend l'app peu importe l'état des fonts.
  // Les fonts Google sont lourdes, sur Android lent ça peut prendre 30s+ — on accepte
  // un fallback vers system fonts plutôt que de laisser l'utilisateur sur un splash infini.
  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const ready = (fontsLoaded || fontError !== null || forceReady) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.mango} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
