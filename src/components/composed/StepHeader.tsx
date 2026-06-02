// StepHeader — header avec bouton retour + étape X sur Y + barre de progression
// Utilisé sur tout le flow Send (4 étapes)
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconArrowL } from '../ui/Icons';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  step: number;
  of: number;
  title: string;
  sub?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

export function StepHeader({ step, of, title, sub, onBack, rightSlot }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <IconArrowL size={16} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.step}>
            Étape {step} sur {of}{sub ? ` · ${sub}` : ''}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightSlot}
      </View>
      <View style={styles.bars}>
        {Array.from({ length: of }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              backgroundColor: i < step ? colors.coral : colors.coralSoft,
            }}
          />
        ))}
      </View>
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
  step: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink2,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.displayMedium, fontSize: 19, color: colors.ink, letterSpacing: -0.2 },
  bars: { marginTop: 14, marginHorizontal: 22, flexDirection: 'row', gap: 5 },
});
