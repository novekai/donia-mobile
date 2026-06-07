// Toggle FCFA / EUR compact (2 boutons côte à côte).
// Discret pour ne pas surcharger l'écran.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import type { Currency } from '../../lib/currency';

type Props = {
  value: Currency;
  onChange: (v: Currency) => void;
};

export function CurrencyToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange('FCFA')}
        style={[styles.btn, value === 'FCFA' && styles.btnActive]}
      >
        <Text style={[styles.text, value === 'FCFA' && styles.textActive]}>FCFA</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('EUR')}
        style={[styles.btn, value === 'EUR' && styles.btnActive]}
      >
        <Text style={[styles.text, value === 'EUR' && styles.textActive]}>€</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 99,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignSelf: 'flex-end',
  },
  btn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  btnActive: { backgroundColor: colors.coral },
  text: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink2 },
  textActive: { color: colors.bg },
});
