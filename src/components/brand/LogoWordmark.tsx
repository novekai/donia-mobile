// LogoWordmark — lockup horizontal : LogoMark + "Donia" en Fraunces
// Source : _prototype/donia/project/logo.jsx:30-48
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { LogoMark } from './LogoMark';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  height?: number;
  dark?: boolean;
  style?: ViewStyle;
};

export function LogoWordmark({ height = 48, dark = false, style }: Props) {
  const textColor = dark ? colors.bg : colors.indigo;
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: height * 0.25 },
        style,
      ]}
    >
      <LogoMark size={height} />
      <Text
        style={{
          fontFamily: fonts.displayMedium,
          fontSize: height * 0.78,
          letterSpacing: -1.5,
          lineHeight: height * 0.85,
          color: textColor,
        }}
      >
        Don
        <Text style={{ fontFamily: fonts.displayItalic, color: colors.coral }}>i</Text>
        a
      </Text>
    </View>
  );
}
