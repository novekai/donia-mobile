// ScreenContainer — wrapper standard de tous les écrans
// SafeAreaView + bg cream + status bar configurée
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
  dark?: boolean;             // status bar style light vs dark
  bg?: string;
  edges?: readonly Edge[];
  avoidKeyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({
  children,
  dark = false,
  bg = colors.bg,
  edges = ['top', 'bottom'],
  avoidKeyboard = false,
  contentStyle,
}: Props) {
  const inner = (
    <View style={[{ flex: 1, backgroundColor: bg }, contentStyle]}>
      {children}
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
