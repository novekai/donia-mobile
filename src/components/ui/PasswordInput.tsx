// PasswordInput — champ mot de passe avec bouton oeil pour toggle affichage
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (s: string) => void;
  autoFocus?: boolean;
};

export function PasswordInput({ label, placeholder, value, onChangeText, autoFocus }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? '••••••••'}
          placeholderTextColor={colors.ink3}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          textContentType="password"
          style={styles.input}
        />
        <Pressable onPress={() => setVisible((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
          <Text style={styles.eye}>{visible ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: { fontSize: 18 },
});
