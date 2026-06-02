// SendStyle — color picker (uni / dégradé) avec aperçu live de la carte
// Inséré après SendAmount. Le palette est encodé "solid:#XXXXXX" ou "gradient:#XXXXXX-#XXXXXX"
// dans le paramètre `palette` lu par SendConfirm.
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { StepHeader } from '../../components/composed/StepHeader';
import { Button } from '../../components/ui/Button';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

// Palette de 24 couleurs couvrant la marque + les variantes complémentaires.
const SWATCHES: string[] = [
  '#F4486F', '#ED4673', '#D62E55', '#FBC4D1', '#FBCAD8', '#F8E6E2',
  '#F9A01C', '#D9871F', '#F547A7', '#FFD1A4', '#FFE082',
  '#41087B', '#2A0454', '#7B278C', '#5C1A6A', '#9B59B6',
  '#5DBFA0', '#4A9E84', '#6FB5D4', '#3B7A98',
  '#FDF7F6', '#FFFFFF', '#2A0F1A', '#6F4A5A',
];

// Both short keys ('anniv', 'amour', …) and long keys ('anniversaire', …) are
// supported so the SendCategory screen and the future Designer-driven catalogue
// can both feed this screen with a category key that matches.
const CATEGORY_LABEL: Record<string, string> = {
  bonjour: 'Bonjour',
  anniv: 'Anniversaire',
  anniversaire: 'Anniversaire',
  bravo: 'Bravo',
  amour: "Je t'aime",
  jetaime: "Je t'aime",
  'saint-valentin': 'Saint-Valentin',
  condo: 'Condoléances',
  condoleances: 'Condoléances',
  mariage: 'Mariage',
  noel: 'Noël',
  tabaski: 'Tabaski',
  naissance: 'Naissance',
  'bon-voyage': 'Bon voyage',
  goshop: 'GoShop',
  diplome: 'Diplôme',
};

const CATEGORY_GREETING: Record<string, string> = {
  bonjour: 'Bonjour à toi,',
  anniv: 'Joyeux anniversaire,',
  anniversaire: 'Joyeux anniversaire,',
  bravo: 'Bravo champion·ne,',
  amour: 'Je t’aime,',
  jetaime: 'Je t’aime,',
  'saint-valentin': 'Je t’aime,',
  condo: 'Toute ma compassion,',
  condoleances: 'Toute ma compassion,',
  mariage: 'Tous mes vœux,',
  noel: 'Joyeux Noël,',
  tabaski: 'Bonne fête de Tabaski,',
  naissance: 'Félicitations,',
  'bon-voyage': 'Bon voyage,',
  goshop: 'Pour toi,',
  diplome: 'Bravo pour ton diplôme,',
};

function hexBrightness(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // perceived luminance — 0 dark, 255 light
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function inkFor(bgHex: string): string {
  return hexBrightness(bgHex) > 180 ? colors.ink : colors.bg;
}

function normalizeHex(input: string): string | null {
  let v = input.trim().replace('#', '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(v)) return null;
  return `#${v}`;
}

export function SendStyleScreen({ navigation, route }: RootStackScreenProps<'SendStyle'>) {
  const { categoryKey, recipientPhone, recipientName, amount } = route.params || {};
  const greeting = CATEGORY_GREETING[categoryKey ?? 'bonjour'] ?? 'Une attention pour toi,';
  const categoryName = CATEGORY_LABEL[categoryKey ?? 'bonjour'] ?? 'Donia';

  const [mode, setMode] = useState<'solid' | 'gradient'>('solid');
  const [start, setStart] = useState<string>('#F4486F');
  const [end, setEnd] = useState<string>('#7B278C');
  const [active, setActive] = useState<'start' | 'end'>('start');
  const [hexDraft, setHexDraft] = useState<string>('');

  const cardInk = mode === 'solid' ? inkFor(start) : colors.bg;
  const gradientColors = mode === 'solid' ? [start, start] : [start, end];

  const currentColor = active === 'start' ? start : end;

  function setActiveColor(hex: string) {
    if (active === 'start') setStart(hex);
    else setEnd(hex);
  }

  function swap() {
    const a = start;
    setStart(end);
    setEnd(a);
  }

  function applyHexDraft() {
    const norm = normalizeHex(hexDraft);
    if (!norm) return;
    setActiveColor(norm);
    setHexDraft('');
  }

  const paletteParam = useMemo(() => {
    return mode === 'solid'
      ? `solid:${start.replace('#', '').toLowerCase()}`
      : `gradient:${start.replace('#', '').toLowerCase()}-${end.replace('#', '').toLowerCase()}`;
  }, [mode, start, end]);

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <StepHeader step={4} of={5} title="Couleur de la carte" sub="Style" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 110 }}>
        {/* Preview */}
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, mode === 'solid' && hexBrightness(start) > 240 && { borderWidth: 1, borderColor: colors.line }]}
        >
          <Text style={[styles.cardEyebrow, { color: cardInk, opacity: 0.85 }]}>donia · {categoryName}</Text>
          <Text style={[styles.cardTitle, { color: cardInk }]}>{greeting}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 14, gap: 6 }}>
            <Text style={[styles.cardAmount, { color: cardInk }]}>{amount ?? '10 000'}</Text>
            <Text style={[styles.cardUnit, { color: cardInk, opacity: 0.85 }]}>FCFA</Text>
          </View>
        </LinearGradient>

        {/* Toggle uni / dégradé */}
        <View style={styles.toggleRow}>
          {(['solid', 'gradient'] as const).map((m) => {
            const on = m === mode;
            const label = m === 'solid' ? 'Couleur unie' : 'Dégradé';
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.toggleBtn, on && styles.toggleBtnOn]}
              >
                <Text style={[styles.toggleText, on && { color: colors.bg }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Active selector(s) */}
        {mode === 'gradient' ? (
          <View style={styles.activeRow}>
            <Pressable
              onPress={() => setActive('start')}
              style={[styles.activeBtn, active === 'start' && styles.activeBtnOn, { borderColor: start }]}
            >
              <View style={[styles.activeSwatch, { backgroundColor: start }]} />
              <View>
                <Text style={styles.activeLabel}>Départ</Text>
                <Text style={styles.activeHex}>{start.toUpperCase()}</Text>
              </View>
            </Pressable>
            <Pressable onPress={swap} style={styles.swapBtn}>
              <Text style={styles.swapText}>⇄</Text>
            </Pressable>
            <Pressable
              onPress={() => setActive('end')}
              style={[styles.activeBtn, active === 'end' && styles.activeBtnOn, { borderColor: end }]}
            >
              <View style={[styles.activeSwatch, { backgroundColor: end }]} />
              <View>
                <Text style={styles.activeLabel}>Fin</Text>
                <Text style={styles.activeHex}>{end.toUpperCase()}</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.singleSelectorRow}>
            <View style={[styles.activeSwatch, { backgroundColor: start }]} />
            <Text style={styles.activeLabel}>Couleur sélectionnée</Text>
            <Text style={[styles.activeHex, { marginLeft: 'auto' }]}>{start.toUpperCase()}</Text>
          </View>
        )}

        {/* Swatch grid */}
        <Text style={styles.gridLabel}>Palette</Text>
        <View style={styles.grid}>
          {SWATCHES.map((sw) => {
            const isCurrent = sw.toLowerCase() === currentColor.toLowerCase();
            return (
              <Pressable
                key={sw}
                onPress={() => setActiveColor(sw)}
                style={[
                  styles.swatch,
                  { backgroundColor: sw },
                  sw === '#FFFFFF' && { borderWidth: 1, borderColor: colors.line },
                  isCurrent && styles.swatchOn,
                ]}
              />
            );
          })}
        </View>

        {/* HEX input */}
        <Text style={styles.gridLabel}>HEX personnalisé</Text>
        <View style={styles.hexRow}>
          <Text style={styles.hashTag}>#</Text>
          <TextInput
            value={hexDraft}
            onChangeText={(v) => setHexDraft(v.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6))}
            placeholder="F4486F"
            placeholderTextColor={colors.ink3}
            autoCapitalize="characters"
            maxLength={6}
            style={styles.hexInput}
          />
          <Pressable
            onPress={applyHexDraft}
            disabled={!normalizeHex(hexDraft)}
            style={[styles.hexApply, !normalizeHex(hexDraft) && { opacity: 0.4 }]}
          >
            <Text style={styles.hexApplyText}>Appliquer</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Valider la couleur"
          pulse
          onPress={() =>
            navigation.navigate('SendConfirm', {
              categoryKey,
              recipientPhone,
              recipientName,
              amount,
              palette: paletteParam,
            })
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: radius.lg,
    padding: 22,
    overflow: 'hidden',
    minHeight: 180,
    justifyContent: 'center',
  },
  cardEyebrow: { fontFamily: fonts.displayItalic, fontSize: 13 },
  cardTitle: { fontFamily: fonts.displayMedium, fontSize: 28, letterSpacing: -0.5, marginTop: 12, lineHeight: 32 },
  cardAmount: { fontFamily: fonts.bodyBold, fontSize: 42, letterSpacing: -1, lineHeight: 42 },
  cardUnit: { fontFamily: fonts.displayItalic, fontSize: 14 },

  toggleRow: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  toggleBtn: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  toggleBtnOn: { backgroundColor: colors.coral },
  toggleText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },

  activeRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.lineSoft,
  },
  activeBtnOn: { borderWidth: 2 },
  activeSwatch: { width: 30, height: 30, borderRadius: 8 },
  activeLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink2 },
  activeHex: { fontFamily: 'monospace', fontSize: 12, color: colors.ink },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: { fontSize: 16, color: colors.ink },

  singleSelectorRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },

  gridLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: fonts.displayItalic,
    fontSize: 13,
    color: colors.ink2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 44, height: 44, borderRadius: 12 },
  swatchOn: { borderWidth: 3, borderColor: colors.ink },

  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  hashTag: { fontFamily: 'monospace', fontSize: 18, color: colors.ink3 },
  hexInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 16,
    color: colors.ink,
  },
  hexApply: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexApplyText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.bg },

  footer: { position: 'absolute', bottom: 22, left: 22, right: 22 },
});
