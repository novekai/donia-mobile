// SegmentedControl — toggle 2 options (Téléphone/Email, WhatsApp/Email, etc.)
// Style : pill blanche avec onglet actif rose corail
import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
  activeColor?: string;       // override la couleur active (ex: WhatsApp = #25D366)
  activeTextColor?: string;
};

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ value, onChange, options, style }: Props<T>) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        const activeColor = opt.activeColor ?? colors.coral;
        const activeText = opt.activeTextColor ?? colors.bg;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.tab,
              active && { backgroundColor: activeColor },
            ]}
          >
            {opt.icon}
            <Text
              style={[
                styles.label,
                { color: active ? activeText : colors.ink2 },
                opt.icon ? { marginLeft: 6 } : null,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.06)',
    gap: 3,
  },
  tab: {
    flex: 1, height: 36,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 9,
  },
  label: { fontFamily: fonts.displayMedium, fontSize: 13 },
});
