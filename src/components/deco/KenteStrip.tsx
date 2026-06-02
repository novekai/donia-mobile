// KenteStrip — bande tissée multicolore inspirée du kente
// Source : _prototype/donia/project/direction-c.jsx:106-114
import React from 'react';
import { View, ViewStyle } from 'react-native';

type Props = {
  height?: number;
  width?: number | `${number}%`;
  style?: ViewStyle;
};

const COLORS = [
  '#F4486F', '#F9A01C', '#41087B', '#FDF7F6',
  '#ED4673', '#5DBFA0', '#F4486F', '#41087B',
  '#F9A01C', '#ED4673', '#FDF7F6', '#5DBFA0',
];

export function KenteStrip({ height = 8, width = '100%' as `${number}%`, style }: Props) {
  return (
    <View
      style={[
        {
          height,
          width,
          flexDirection: 'row',
          borderRadius: 99,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {COLORS.map((c, i) => (
        <View key={i} style={{ flex: i % 2 ? 2 : 1, backgroundColor: c }} />
      ))}
    </View>
  );
}
