// Input — champ texte standard Donia (cream BG, border subtle, focus coral)
import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({ label, hint, error, leftIcon, rightIcon, containerStyle, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor =
    error ? colors.coralDeep
    : focused ? colors.coral
    : 'rgba(42,15,26,0.10)';

  return (
    <View style={[{ marginBottom: spacing.sm }, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, { borderColor }]}>
        {leftIcon}
        <TextInput
          placeholderTextColor={colors.ink3}
          style={[styles.input, { paddingLeft: leftIcon ? 8 : 14 }]}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
        />
        {rightIcon}
      </View>
      {(hint || error) && (
        <Text style={[styles.hint, error && { color: colors.coralDeep }]}>{error || hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink2,
    marginBottom: 6, paddingLeft: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm, borderWidth: 1,
    paddingRight: 14, minHeight: 48,
  },
  input: {
    flex: 1, paddingVertical: 12,
    color: colors.ink, fontFamily: fonts.bodyRegular, fontSize: 15,
  },
  hint: {
    fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.ink3,
    marginTop: 4, paddingLeft: 4,
  },
});
