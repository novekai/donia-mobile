// Receive — confettis + carte cadeau + réactions + code retrait + breakdown commission
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Confetti } from '../../components/ui/Confetti';
import { GiftCard } from '../../components/ui/GiftCard';
import { Card } from '../../components/ui/Card';
import { IconCheck } from '../../components/ui/Icons';
import { useFloat, useWiggle, useBob } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const REACTIONS = ['❤️', '🎉', '🙏', '😍', '✨'];

function ReactionBtn({ emoji, delay }: { emoji: string; delay: number }) {
  const bobStyle = useBob({ delay: delay * 1000 });
  return (
    <Animated.View style={bobStyle}>
      <Pressable style={styles.reactBtn}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ReceiveScreen({ navigation }: RootStackScreenProps<'Receive'>) {
  const [choice, setChoice] = useState<'mm' | 'donia'>('mm');
  const wiggleStyle = useWiggle();
  const floatStyle = useFloat({ duration: 6000 });

  return (
    <ScreenContainer>
      <Confetti count={50} />
      <FunBackground palette="cream" />

      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, fontFamily: fonts.bodyBold, color: colors.ink }}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>De Marie</Text>
        <Text style={styles.headerDate}>26 mai 2026</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 120 }}>
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <Text style={styles.title}>
            Awa, <Text style={styles.titleItalic}>tu as reçu</Text> un cadeau{' '}
            <Animated.Text style={[wiggleStyle, { display: 'flex' }]}>🎁</Animated.Text>
          </Text>
        </View>

        <Animated.View style={floatStyle}>
          <GiftCard
            occasion="Joyeux anniversaire,"
            amount="5 000"
            recipient="Awa"
            sender="Marie"
            message="Bonne fête d'anniversaire ma chérie 🌻"
            palette="pink"
          />
        </Animated.View>

        {/* Reactions */}
        <View style={styles.reactionsRow}>
          {REACTIONS.map((e, i) => <ReactionBtn key={i} emoji={e} delay={i * 0.2} />)}
        </View>

        {/* Unlock code card */}
        <BrandGradient variant="indigo" style={styles.codeCard}>
          <Sparkle size={12} color={colors.mango} style={{ position: 'absolute', top: 10, right: 14 }} />
          <View style={styles.codeIcon}>
            <Text style={{ fontSize: 18 }}>🔓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.codeKicker}>Code de retrait</Text>
            <Text style={styles.codeValue}>
              DON-2026-<Text style={{ color: colors.mango }}>A7K91</Text>
            </Text>
          </View>
          <Pressable style={styles.copyBtn}>
            <Text style={styles.copyText}>Copier</Text>
          </Pressable>
        </BrandGradient>
        <Text style={styles.codeHint}>Conserve ce code — il permet la conversion de ta carte en argent.</Text>

        {/* Breakdown */}
        <Card pad={16} style={{ marginTop: 12 }}>
          <View style={styles.brRow}>
            <Text style={styles.brLabel}>Montant de la carte</Text>
            <Text style={styles.brValue}>5 000 FCFA</Text>
          </View>
          <View style={[styles.brRow, { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }]}>
            <Text style={styles.brLabel}>
              Commission Donia <Text style={{ fontSize: 10, color: colors.ink3 }}>(5%)</Text>
            </Text>
            <Text style={[styles.brValue, { color: colors.coralDeep }]}>−250 FCFA</Text>
          </View>
          <View style={[styles.brRow, { paddingTop: 10, alignItems: 'baseline' }]}>
            <Text style={styles.totalLabel}>Tu reçois</Text>
            <Text style={styles.totalAmt}>4 750 FCFA</Text>
          </View>
        </Card>

        {/* Conversion choice */}
        <Text style={[styles.label, { textAlign: 'center', marginTop: 14, marginBottom: 8 }]}>Où veux-tu recevoir ?</Text>
        <View style={{ gap: 6 }}>
          {[
            { id: 'mm' as const, title: 'Mobile Money', sub: 'MTN Bénin · 1 min', accent: colors.mint, emoji: '📱' },
            { id: 'donia' as const, title: 'Compte Donia', sub: 'Instantané', accent: colors.mango, emoji: '🏠' },
          ].map((opt) => {
            const on = choice === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setChoice(opt.id)}
                style={[styles.choice, on && { borderWidth: 1.5, borderColor: opt.accent }]}
              >
                <View style={[styles.choiceIcon, { backgroundColor: on ? opt.accent : colors.bg2 }]}>
                  <Text style={{ fontSize: 14 }}>{opt.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.choiceTitle}>{opt.title}</Text>
                  <Text style={styles.choiceSub}>{opt.sub}</Text>
                </View>
                <View style={[styles.radio, on && { backgroundColor: opt.accent, borderWidth: 0 }]}>
                  {on && <IconCheck size={11} color={colors.bg} strokeWidth={3.5} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Convertir & recevoir 4 750 FCFA" variant="mint" pulse onPress={() => navigation.replace('RedeemSuccess', { amount: '4 750', sender: 'Marie' })} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.displayItalic, fontSize: 17, color: colors.ink },
  headerDate: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink2 },
  title: { fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, textAlign: 'center', letterSpacing: -0.5, lineHeight: 28 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  reactionsRow: { marginTop: 12, flexDirection: 'row', gap: 5, justifyContent: 'center' },
  reactBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  codeCard: { marginTop: 16, padding: 14, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' },
  codeIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(249,160,28,0.2)', alignItems: 'center', justifyContent: 'center' },
  codeKicker: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.mango, letterSpacing: 1, textTransform: 'uppercase' },
  codeValue: { fontFamily: fonts.bodyBold, fontSize: 19, color: colors.bg, letterSpacing: 0.5, marginTop: 2 },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,241,220,0.15)', borderWidth: 1, borderColor: 'rgba(255,241,220,0.3)' },
  copyText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.bg },
  codeHint: { marginTop: 8, fontSize: 11, color: colors.ink2, fontFamily: fonts.displayItalic },
  brRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  brLabel: { fontSize: 13, color: colors.ink2 },
  brValue: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.ink },
  totalLabel: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  totalAmt: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.mint, letterSpacing: -0.4 },
  label: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2 },
  choice: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 10 },
  choiceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },
  choiceSub: { fontSize: 10, color: colors.ink3 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
