// ScreenHeader — header générique : back button + titre (display) + action droite optionnelle
import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { IconArrowL } from '../ui/Icons';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  hideBack?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({ title, subtitle, onBack, rightAction, hideBack, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {!hideBack && (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <IconArrowL size={16} color={colors.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  title: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.ink, letterSpacing: -0.4 },
});
