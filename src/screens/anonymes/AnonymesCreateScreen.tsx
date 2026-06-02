// Anonymes — création / régénération d'un lien (Direction C v2 mockup).
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Button } from '../../components/ui/Button';
import { IconCheck, IconAnonyme } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { createAnonymousLink } from '../../api/anonymes';
import { getApiErrorMessage } from '../../api/client';
import type { AnonymousTheme } from '../../api/types';

const SUGGESTIONS = [
  'Dis-moi un secret 🤫',
  "Envoie-moi un mot d'amour 💌",
  'Tu penses quoi de moi ?',
  'Compliment-moi anonymement ✨',
];

const THEMES: { key: AnonymousTheme; variant: 'indigo' | 'coral' | 'mango' | 'pink' | 'mint' }[] = [
  { key: 'indigo', variant: 'indigo' },
  { key: 'coral', variant: 'coral' },
  { key: 'mango', variant: 'mango' },
  { key: 'pink', variant: 'pink' },
  { key: 'mint', variant: 'mint' },
];

export function AnonymesCreateScreen({ navigation }: RootStackScreenProps<'AnonymesCreate'>) {
  const [prompt, setPrompt] = useState('Dis-moi un secret 🤫');
  const [theme, setTheme] = useState<AnonymousTheme>('indigo');
  const bobStyle = useBob({ duration: 4500 });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createAnonymousLink({ prompt, theme }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['anon-active'] });
      queryClient.invalidateQueries({ queryKey: ['anon-messages'] });
      navigation.replace('AnonymesLink', { code: res.link.code });
    },
    onError: (e) => Alert.alert('Création échouée', getApiErrorMessage(e)),
  });

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader subtitle="Personnalise" title="Nouveau lien" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        {/* Live preview */}
        <BrandGradient variant={THEMES.find((t) => t.key === theme)?.variant ?? 'indigo'} style={[styles.preview, shadow.indigo]}>
          <View pointerEvents="none" style={styles.previewDeco}>
            <ConcentricRings size={120} color={colors.mango} opacity={0.2} anim="spin" />
          </View>
          <Animated.View style={[bobStyle, styles.maskBubble]}>
            <IconAnonyme size={28} color={colors.mango} />
          </Animated.View>
          <Text style={styles.previewLabel}>APERÇU</Text>
          <Text style={styles.previewPrompt}>{prompt || 'Ton accroche apparaîtra ici'}</Text>
          <Text style={styles.previewUrl}>doniia.com/a/xxxxxxx</Text>
        </BrandGradient>

        {/* Prompt input */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Message d'accroche</Text>
            <Text style={styles.counter}>{prompt.length} / 80</Text>
          </View>
          <TextInput
            value={prompt}
            onChangeText={(v) => v.length <= 80 && setPrompt(v)}
            style={styles.input}
            placeholderTextColor={colors.ink3}
          />
          <View style={styles.sugRow}>
            {SUGGESTIONS.map((s) => {
              const on = s === prompt;
              return (
                <Pressable key={s} onPress={() => setPrompt(s)} style={[styles.sug, on && styles.sugOn]}>
                  <Text style={[styles.sugText, on && styles.sugTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Theme picker */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Thème visuel</Text>
          <View style={styles.themeRow}>
            {THEMES.map((t) => {
              const on = t.key === theme;
              return (
                <Pressable key={t.key} onPress={() => setTheme(t.key)} style={[styles.themeBtn, on && styles.themeOn]}>
                  <BrandGradient variant={t.variant} style={styles.themeSwatch}>
                    {on && (
                      <View style={styles.themeCheck}>
                        <IconCheck size={12} color={colors.ink} strokeWidth={3.5} />
                      </View>
                    )}
                  </BrandGradient>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={createMutation.isPending ? 'Création…' : 'Générer mon lien ✨'}
          pulse
          disabled={createMutation.isPending || !prompt.trim()}
          onPress={() => createMutation.mutate()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: 20, padding: 24, alignItems: 'center', overflow: 'hidden', position: 'relative' },
  previewDeco: { position: 'absolute', top: -30, right: -30 },
  maskBubble: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(253,247,246,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  previewLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mango, letterSpacing: 1.2 },
  previewPrompt: { marginTop: 8, fontFamily: fonts.displayMedium, fontSize: 22, color: colors.bg, letterSpacing: -0.3, textAlign: 'center' },
  previewUrl: { marginTop: 6, fontSize: 12, color: colors.bg, opacity: 0.75, fontFamily: fonts.bodyBold },

  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  counter: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.ink3 },
  input: { height: 50, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.indigo, paddingHorizontal: 14, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  sugRow: { marginTop: 8, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  sug: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  sugOn: { backgroundColor: 'rgba(65,8,123,0.1)', borderColor: colors.indigo },
  sugText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink2 },
  sugTextOn: { color: colors.indigo },

  themeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  themeBtn: { flex: 1, aspectRatio: 1, borderRadius: 14, padding: 2 },
  themeOn: { borderWidth: 2, borderColor: colors.ink },
  themeSwatch: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  themeCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
