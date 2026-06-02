// Anonymes — vue "Mon lien anonyme" (après création) avec QR + boutons de partage social.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Share, Alert, Clipboard } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const SHARE_URL_BASE = 'https://doniia.com/a';

// "QR code" — pseudo-random visual generated from the code seed.
// Pas un vrai QR scannable (Phase 5 quand on aura react-native-qrcode-svg).
function FakeQR({ seed }: { seed: string }) {
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  for (let i = 0; i < 121; i++) {
    const v = (((i * 7) % 13) + ((i * 3) % 11)) % 5 < 2 || (i < 25 && (i % 11) < 4) || ((i % 11) > 6 && i < 25) || (i > 95 && (i % 11) < 4);
    cells.push(v);
  }
  return (
    <View style={styles.qrWrap}>
      {cells.map((on, i) => (
        <View key={i} style={[styles.qrCell, { backgroundColor: on ? colors.indigoDeep : 'transparent' }]} />
      ))}
    </View>
  );
}

const SOCIALS: { l: string; bg: string; ink?: string; e: string }[] = [
  { l: 'WhatsApp', bg: '#25D366', e: '💬' },
  { l: 'Instagram', bg: '#E1306C', e: '📸' },
  { l: 'TikTok', bg: '#2A0F1A', e: '🎵' },
  { l: 'Snapchat', bg: '#F9A01C', ink: '#2A0F1A', e: '👻' },
  { l: 'X', bg: '#2A0F1A', e: '𝕏' },
  { l: 'Facebook', bg: '#41087B', e: 'f' },
];

export function AnonymesLinkScreen({ navigation, route }: RootStackScreenProps<'AnonymesLink'>) {
  const code = route.params?.code ?? '';
  const url = `${SHARE_URL_BASE}/${code}`;

  async function onCopy() {
    Clipboard.setString(url);
    Alert.alert('Copié ✨', url);
  }

  async function onShare(prefilledText?: string) {
    try {
      await Share.share({
        message: prefilledText ? `${prefilledText}\n\n${url}` : `Écris-moi en anonyme : ${url}`,
        url,
      });
    } catch {}
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader subtitle="Prêt à partager" title="Mon lien anonyme" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 60 }}>
        {/* QR card */}
        <BrandGradient variant="indigo" style={[styles.qrCard, shadow.indigo]}>
          <View pointerEvents="none" style={styles.qrDeco}>
            <ConcentricRings size={160} color={colors.mango} opacity={0.2} anim="spin" />
          </View>
          <FakeQR seed={code} />
          <Text style={styles.url}>
            doniia.com/a/<Text style={{ color: colors.mango }}>{code}</Text>
          </Text>
          <Text style={styles.urlSub}>Scanne ou partage ton lien</Text>
        </BrandGradient>

        {/* 3 quick actions */}
        <View style={styles.quickRow}>
          <Pressable onPress={onCopy} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>📋</Text>
            <Text style={styles.quickText}>Copier</Text>
          </Pressable>
          <Pressable onPress={() => onShare()} style={[styles.quickBtn, styles.quickPrimary]}>
            <Text style={styles.quickEmoji}>🔗</Text>
            <Text style={[styles.quickText, { color: colors.bg }]}>Partager</Text>
          </Pressable>
          <Pressable onPress={() => Alert.alert('Bientôt', 'Le visuel téléchargeable arrive dans une prochaine version.')} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>🖼️</Text>
            <Text style={styles.quickText}>Visuel</Text>
          </Pressable>
        </View>

        {/* Social share grid */}
        <Text style={styles.socialLabel}>Partager en story</Text>
        <View style={styles.socialGrid}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.l}
              onPress={() => onShare(`Envoie-moi un message anonyme via Donia 💌`)}
              style={styles.socialBtn}
            >
              <View style={[styles.socialIcon, { backgroundColor: s.bg }]}>
                <Text style={[styles.socialEmoji, { color: s.ink ?? colors.bg }]}>{s.e}</Text>
              </View>
              <Text style={styles.socialText}>{s.l}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  qrCard: { borderRadius: 22, padding: 24, alignItems: 'center', overflow: 'hidden', position: 'relative' },
  qrDeco: { position: 'absolute', bottom: -40, left: -40 },
  qrWrap: { width: 150, height: 150, backgroundColor: colors.bg, borderRadius: 18, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  qrCell: { width: 9.4, height: 9.4, borderRadius: 1 },
  url: { marginTop: 14, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.bg },
  urlSub: { marginTop: 4, fontSize: 12, color: colors.bg, opacity: 0.7, fontStyle: 'italic' },

  quickRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(42,15,26,0.1)', backgroundColor: colors.surface, alignItems: 'center', gap: 5 },
  quickPrimary: { backgroundColor: colors.coral, borderColor: colors.coral },
  quickEmoji: { fontSize: 20 },
  quickText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },

  socialLabel: { marginTop: 18, fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 10 },
  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  socialBtn: { width: '31.5%', flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(42,15,26,0.08)', backgroundColor: colors.surface },
  socialIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  socialEmoji: { fontSize: 13, fontFamily: fonts.bodyBold },
  socialText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
});
