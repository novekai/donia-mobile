// DateOfBirthPicker — 3 sélecteurs (Jour / Mois / Année) sous forme de menus déroulants.
// Plus user-friendly qu'une saisie manuelle.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  day: string;            // "" ou "1".."31"
  month: string;          // "" ou "1".."12"
  year: string;           // "" ou "1925".."2026"
  onChange: (next: { day: string; month: string; year: string }) => void;
};

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function daysInMonth(month: number, year: number): number {
  if (month === 2) return year > 0 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

type FieldKey = 'day' | 'month' | 'year';

export function DateOfBirthPicker({ day, month, year, onChange }: Props) {
  const [open, setOpen] = useState<FieldKey | null>(null);

  const currentYear = 2026;       // borne supérieure (rester >= 16 ans → max 2010)
  const minAge = 13;
  const yearMax = currentYear - minAge;
  const yearMin = currentYear - 100;

  // Génère les choix dynamiquement selon le contexte
  const m = Number(month) || 0;
  const y = Number(year) || 0;
  const maxDay = m > 0 && y > 0 ? daysInMonth(m, y) : 31;
  const dayChoices = Array.from({ length: maxDay }, (_, i) => String(i + 1));
  const monthChoices = MONTHS.map((label, i) => ({ label, value: String(i + 1) }));
  const yearChoices = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => String(yearMax - i));

  const dayLabel = day || 'Jour';
  const monthLabel = month ? MONTHS[Number(month) - 1] : 'Mois';
  const yearLabel = year || 'Année';

  function pick(field: FieldKey, value: string) {
    if (field === 'day') onChange({ day: value, month, year });
    else if (field === 'month') {
      // Si le jour devient invalide après changement de mois, on le clear
      const newM = Number(value);
      const newMax = y > 0 ? daysInMonth(newM, y) : 31;
      const newDay = Number(day) > newMax ? '' : day;
      onChange({ day: newDay, month: value, year });
    } else {
      onChange({ day, month, year: value });
    }
    setOpen(null);
  }

  return (
    <>
      <View style={styles.row}>
        <Pressable onPress={() => setOpen('day')} style={[styles.cell, day && styles.cellFilled]}>
          <Text style={[styles.cellText, !day && styles.cellPlaceholder]}>{dayLabel}</Text>
        </Pressable>
        <Pressable onPress={() => setOpen('month')} style={[styles.cell, month && styles.cellFilled]}>
          <Text style={[styles.cellText, !month && styles.cellPlaceholder]} numberOfLines={1}>
            {monthLabel}
          </Text>
        </Pressable>
        <Pressable onPress={() => setOpen('year')} style={[styles.cell, year && styles.cellFilled]}>
          <Text style={[styles.cellText, !year && styles.cellPlaceholder]}>{yearLabel}</Text>
        </Pressable>
      </View>

      <Modal visible={open !== null} animationType="slide" transparent onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {open === 'day' ? 'Choisis le jour' : open === 'month' ? 'Choisis le mois' : 'Choisis l\'année'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {open === 'day' &&
                dayChoices.map((d) => (
                  <Pressable key={d} onPress={() => pick('day', d)} style={styles.option}>
                    <Text style={[styles.optionText, day === d && styles.optionTextActive]}>{d}</Text>
                  </Pressable>
                ))}
              {open === 'month' &&
                monthChoices.map((mo) => (
                  <Pressable key={mo.value} onPress={() => pick('month', mo.value)} style={styles.option}>
                    <Text style={[styles.optionText, month === mo.value && styles.optionTextActive]}>{mo.label}</Text>
                  </Pressable>
                ))}
              {open === 'year' &&
                yearChoices.map((yr) => (
                  <Pressable key={yr} onPress={() => pick('year', yr)} style={styles.option}>
                    <Text style={[styles.optionText, year === yr && styles.optionTextActive]}>{yr}</Text>
                  </Pressable>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.08)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { borderColor: 'rgba(244,72,111,0.35)', backgroundColor: 'rgba(244,72,111,0.04)' },
  cellText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  cellPlaceholder: { color: colors.ink3, fontFamily: fonts.bodyRegular },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 30, maxHeight: '70%' },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 99, backgroundColor: colors.line, marginBottom: 14 },
  sheetTitle: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink, marginBottom: 10, textAlign: 'center' },
  option: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10 },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.ink, textAlign: 'center' },
  optionTextActive: { color: colors.coral, fontFamily: fonts.bodyBold },
});
