// Referral — vraies stats fetchées depuis /v1/referral.
// Remplace le mock hardcoded "AWA-2026 / 7 / 30 000".
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
  RefreshControl,
  Clipboard,
  Linking,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { SunRays } from '../../components/deco/SunRays';
import { Sparkle } from '../../components/deco/Sparkle';
import { HibiscusBurst } from '../../components/deco/HibiscusBurst';
import { KenteStrip } from '../../components/deco/KenteStrip';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useBob } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getReferral } from '../../api/referral';
import { getApiErrorMessage } from '../../api/client';

// SMS retiré sur demande Paul (06/2026) — on garde uniquement WhatsApp + Lien copiable.
type ShareKey = 'whatsapp' | 'link';
const SHARES: { key: ShareKey; bg: string; emoji: string }[] = [
  { key: 'whatsapp', bg: '#25D366', emoji: '💬' },
  { key: 'link', bg: colors.coral, emoji: '🔗' },
];

function referralUrl(code: string): string {
  return `https://doniia.com/?ref=${encodeURIComponent(code)}`;
}

function formatAmount(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ');
}

function ShareBtn({
  s,
  label,
  delay,
  onPress,
}: {
  s: (typeof SHARES)[number];
  label: string;
  delay: number;
  onPress: () => void;
}) {
  const bobStyle = useBob({ delay: delay * 1000 });
  return (
    <Animated.View style={[bobStyle, { flex: 1 }]}>
      <Pressable onPress={onPress} style={[styles.share, { backgroundColor: s.bg }]}>
        <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
        <Text style={styles.shareText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ReferralScreen({ navigation }: RootStackScreenProps<'Referral'>) {
  const { t } = useTranslation();
  const bobStyle = useBob();
  const referralQuery = useQuery({
    queryKey: ['referral'],
    queryFn: getReferral,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Copie directe dans le presse-papier système pour que l'utilisateur puisse
  // coller le code partout (notes, WhatsApp, sms, autres apps).
  async function onCopyCode(code: string) {
    Clipboard.setString(code);
    Alert.alert(t('referral.codeCopiedTitle'), t('referral.codeCopiedBody', { code }));
  }

  async function onShare(channel: 'whatsapp' | 'link', code: string) {
    const text = `Rejoins-moi sur Donia ! Avec mon code ${code} tu as un cadeau de bienvenue 🎁`;
    const url = referralUrl(code);

    if (channel === 'link') {
      Clipboard.setString(url);
      Alert.alert(t('referral.linkCopiedTitle'), t('referral.linkCopiedBody'));
      return;
    }

    if (channel === 'whatsapp') {
      // Deep-link WhatsApp : ouvre l'app sur l'écran de sélection de contact
      // avec le texte pré-rempli. L'utilisateur choisit lui-même le destinataire.
      const deepLink = `whatsapp://send?text=${encodeURIComponent(`${text}\n${url}`)}`;
      try {
        const ok = await Linking.canOpenURL(deepLink);
        if (ok) {
          await Linking.openURL(deepLink);
          return;
        }
      } catch {}
      // Fallback : sheet de partage système si WhatsApp pas installé.
      try {
        await Share.share({ message: `${text}\n${url}` });
      } catch {}
    }
  }

  if (referralQuery.isLoading) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" />
        <ScreenHeader title={t('referral.title')} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.coral} />
        </View>
      </ScreenContainer>
    );
  }

  if (referralQuery.isError || !referralQuery.data) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" />
        <ScreenHeader title={t('referral.title')} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink, textAlign: 'center' }}>
            {t('referral.loadFail')}
          </Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: colors.ink2, textAlign: 'center' }}>
            {getApiErrorMessage(referralQuery.error)}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const { code, filleulsCount, totalEarned, rate } = referralQuery.data;
  const ratePct = Math.round(rate * 100);

  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <ScreenHeader title="Inviter des amis" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={referralQuery.isFetching}
            onRefresh={() => referralQuery.refetch()}
            tintColor={colors.coral}
          />
        }
      >
        <BrandGradient variant="indigo" style={[styles.hero, shadow.indigo]}>
          <View style={{ position: 'absolute', top: -80, left: '50%', marginLeft: -130, opacity: 0.3 }}>
            <SunRays size={260} color={colors.mango} />
          </View>
          <Sparkle size={20} color={colors.mango} style={{ position: 'absolute', top: 22, right: 30 }} />
          <Sparkle size={14} color={colors.pink} delay={1} style={{ position: 'absolute', top: 60, left: 30 }} />
          <HibiscusBurst
            size={40}
            color={colors.pink}
            anim="float"
            style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }}
          />

          <View style={{ alignItems: 'center' }}>
            <Animated.Text style={[bobStyle, { fontSize: 38 }]}>🎉</Animated.Text>
            <Text style={styles.heroTitle}>{t('referral.tagline', { pct: ratePct })}</Text>
            <Text style={styles.heroSub}>{t('referral.subTagline')}</Text>
            <KenteStrip height={5} width={'45%'} style={{ marginTop: 16 }} />
          </View>
        </BrandGradient>

        <View style={styles.statsRow}>
          <Card pad={14} style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.coral }]}>{filleulsCount}</Text>
            <Text style={styles.statLabel}>{t('referral.filleulsActive', { count: filleulsCount })}</Text>
          </Card>
          <Card pad={14} style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.mango }]}>{formatAmount(totalEarned)}</Text>
            <Text style={styles.statLabel}>{t('referral.fcfaEarned')}</Text>
          </Card>
        </View>

        <Text style={styles.label}>{t('referral.yourCode')}</Text>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{code}</Text>
          <Pressable style={styles.copy} onPress={() => onCopyCode(code)}>
            <Text style={styles.copyText}>{t('common.copy')}</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>{t('referral.shareLabel')}</Text>
        <View style={styles.sharesRow}>
          {SHARES.map((s, i) => (
            <ShareBtn
              key={s.key}
              s={s}
              label={s.key === 'whatsapp' ? t('referral.shareWhatsApp') : t('referral.shareLink')}
              delay={i * 0.3}
              onPress={() => onShare(s.key, code)}
            />
          ))}
        </View>
        <Text style={styles.shareHint}>{t('referral.shareHint')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 24, overflow: 'hidden', alignItems: 'center' },
  heroTitle: {
    marginTop: 6,
    fontFamily: fonts.displayMedium,
    fontSize: 44,
    color: colors.mango,
    letterSpacing: -1.3,
    lineHeight: 46,
  },
  heroSub: { marginTop: 8, fontSize: 13, color: colors.bg, textAlign: 'center', lineHeight: 19, opacity: 0.9 },
  statsRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fonts.bodyBold, fontSize: 28, letterSpacing: -0.6 },
  statLabel: { fontSize: 11, color: colors.ink2, fontFamily: fonts.displayItalic, marginTop: 2 },
  label: { marginTop: 18, fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8 },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.coral,
    paddingHorizontal: 16,
    gap: 8,
  },
  code: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 22, color: colors.coral, letterSpacing: 1.2 },
  copy: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.coral },
  copyText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.bg },
  sharesRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  share: { paddingVertical: 22, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', gap: 8, minHeight: 84, justifyContent: 'center' },
  shareText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.bg, textAlign: 'center' },
  shareHint: { marginTop: 10, fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink3, textAlign: 'center', lineHeight: 16 },
});
