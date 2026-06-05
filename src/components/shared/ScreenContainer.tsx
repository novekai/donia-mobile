// ScreenContainer — wrapper standard de tous les écrans
// SafeAreaView + bg cream + status bar configurée
// Si `tabBar` est fourni, on affiche aussi la TabBar du bas (utile pour les écrans
// secondaires comme Notifications/Wallet/KYC/Security qui doivent garder la nav rapide
// vers Accueil/Envoyer/Anonymes/Activité).
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/tokens';
import { TabBar, type TabId } from '../ui/TabBar';

type Props = {
  children: React.ReactNode;
  dark?: boolean;             // status bar style light vs dark
  bg?: string;
  edges?: readonly Edge[];
  avoidKeyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  tabBar?: TabId | null;       // si fourni, affiche la TabBar du bas (avec l'onglet actif)
};

const TAB_TO_ROUTE: Record<TabId, 'Home' | 'Send' | 'Anonyme' | 'History'> = {
  home: 'Home',
  send: 'Send',
  anonyme: 'Anonyme',
  history: 'History',
};

export function ScreenContainer({
  children,
  dark = false,
  bg = colors.bg,
  edges = ['top', 'bottom'],
  avoidKeyboard = false,
  contentStyle,
  tabBar,
}: Props) {
  // useNavigation est null-safe côté typage ; en pratique on est toujours dans un Navigator.
  const navigation = useNavigation<{ navigate: (n: string, p?: object) => void }>();

  const tabBarNode = tabBar ? (
    <TabBar
      active={tabBar}
      onPress={(id) => navigation.navigate('Main', { screen: TAB_TO_ROUTE[id] })}
    />
  ) : null;

  const inner = (
    <View style={[{ flex: 1, backgroundColor: bg }, contentStyle]}>
      {children}
      {tabBarNode}
    </View>
  );

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: bg }]}>
        {avoidKeyboard ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {inner}
          </KeyboardAvoidingView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
