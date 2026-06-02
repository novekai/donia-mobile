// Card — surface élevée standard (blanc, radius lg, ombre légère)
import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'flat' | 'low' | 'mid' | 'high';
  rounded?: keyof typeof radius;
  pad?: number;
};

export function Card({ children, style, elevation = 'low', rounded = 'lg', pad }: Props) {
  const shadowStyle =
    elevation === 'flat' ? undefined
    : elevation === 'low' ? shadow.e1
    : elevation === 'mid' ? shadow.e2
    : shadow.e3;

  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius[rounded], padding: pad },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.06)',
  },
});
