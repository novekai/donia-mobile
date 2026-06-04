// Anonymes — vue "Mon lien anonyme" (après création) avec QR scannable réel
// + visuel téléchargeable (capture de la carte) + partage social amélioré.
//
// Deps :
// - react-native-qrcode-svg : génère un QR PNG/SVG réel scannable
// - react-native-view-shot   : capture une <View> en image (PNG)
// - expo-sharing             : ouvre la sheet système pour sauver / partager
//
// X (Twitter) retiré sur demande Paul — on garde WhatsApp / Instagram / TikTok / Snapchat / Facebook.
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  Alert,
  Clipboard,
  Linking,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const SHARE_URL_BASE = 'https://doniia.com/a';

type Social = {
  l: string;
  bg: string;
  ink?: string;
  emoji: string;
  // Deep link à essayer en premier ; fallback sur Share.share() si l'app n'est pas installée.
  scheme?: (url: string, text: string) => string;
};

// Note : X (Twitter) retiré. Ordre = importance pour la cible Donia (Afrique de l'Ouest).
const SOCIALS: Social[] = [
  {
    l: 'WhatsApp',
    bg: '#25D366',
    emoji: '💬',
    scheme: (url, text) => `whatsapp://send?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    l: 'Instagram',
    bg: '#E1306C',
    emoji: '📸',
    // Pas de scheme partage texte fiable sur IG → on tombera sur Share natif.
  },
  {
    l: 'TikTok',
    bg: '#1a1a1a',
    emoji: '🎵',
  },
  {
    l: 'Snapchat',
    bg: '#FFFC00',
    ink: '#1a1a1a',
    emoji: '👻',
  },
  {
    l: 'Facebook',
    bg: '#1877F2',
    emoji: 'f',
    scheme: (url) => `fb://share?link=${encodeURIComponent(url)}`,
  },
];

export function AnonymesLinkScreen({ navigation, route }: RootStackScreenProps<'AnonymesLink'>) {
  const code = route.params?.code ?? '';
  const url = `${SHARE_URL_BASE}/${code}`;
  const shareCardRef = useRef<ViewShot>(null);
  const [generating, setGenerating] = useState(false);

  async function onCopy() {
    Clipboard.setString(url);
    Alert.alert('Copié ✨', url);
  }

  async function onShareNative(text: string) {
    try {
      await Share.share({
        message: `${text}\n\n${url}`,
        url,
      });
    } catch {}
  }

  async function onShareSocial(s: Social) {
    const text = 'Envoie-moi un message anonyme via Donia 💌';
    if (s.scheme) {
      const deepLink = s.scheme(url, text);
      try {
        const ok = await Linking.canOpenURL(deepLink);
        if (ok) {
          await Linking.openURL(deepLink);
          return;
        }
      } catch {}
    }
    await onShareNative(text);
  }

  // Capture la carte gradient (QR + branding) en PNG puis ouvre la sheet de partage système.
  // Sur iOS l'utilisateur peut Save Image / Stories / Snap directement.
  // Sur Android il peut Enregistrer ou Partager vers Stories.
  async function onShareVisual() {
    if (generating) return;
    setGenerating(true);
    try {
      const ref = shareCardRef.current;
      if (!ref) throw new Error('Card not ready');
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      const ok = await Sharing.isAvailableAsync();
      if (!ok) {
        Alert.alert('Partage indisponible', 'Le partage de visuel n\'est pas disponible sur cet appareil.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Partager mon lien Donia',
        UTI: 'public.png',
      });
    } catch (e) {
      Alert.alert('Visuel indisponible', 'Impossible de générer le visuel. Réessaie dans un instant.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader subtitle="Prêt à partager" title="Mon lien anonyme" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 60 }}>
        {/* QR card (capturable pour le visuel téléchargeable) */}
        <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 1 }}>
          <BrandGradient variant="indigo" style={[styles.qrCard, shadow.indigo]}>
            <View pointerEvents="none" style={styles.qrDecoRing}>
              <ConcentricRings size={220} color={colors.mango} opacity={0.18} anim="spin" />
            </View>

            <View style={styles.qrTopBrand}>
              <Text style={styles.qrBrandPill}>Donia</Text>
              <Text style={styles.qrBrandTagline}>Messages anonymes ✨</Text>
            </View>

            <View style={styles.qrFrame}>
              <QRCode
                value={url}
                size={170}
                color={colors.indigoDeep}
                backgroundColor="#ffffff"
                ecl="H"
                quietZone={6}
              />
            </View>

            <Text style={styles.url}>
              doniia.com/a/<Text style={{ color: colors.mango }}>{code}</Text>
            </Text>
            <Text style={styles.urlSub}>Scanne ou partage ton lien</Text>
          </BrandGradient>
        </ViewShot>

        {/* 3 quick actions */}
        <View style={styles.quickRow}>
          <Pressable onPress={onCopy} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>📋</Text>
            <Text style={styles.quickText}>Copier</Text>
          </Pressable>
          <Pressable onPress={() => onShareNative('Écris-moi en anonyme :')} style={[styles.quickBtn, styles.quickPrimary]}>
            <Text style={styles.quickEmoji}>🔗</Text>
            <Text style={[styles.quickText, { color: colors.bg }]}>Partager</Text>
          </Pressable>
          <Pressable onPress={onShareVisual} disabled={generating} style={[styles.quickBtn, generating && { opacity: 0.6 }]}>
            {generating ? (
              <ActivityIndicator color={colors.coral} size="small" />
            ) : (
              <>
                <Text style={styles.quickEmoji}>🖼️</Text>
                <Text style={styles.quickText}>Visuel</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Social share grid — 5 réseaux, layout 3+2 centré */}
        <Text style={styles.socialLabel}>Partager en story</Text>
        <View style={styles.socialRow}>
          {SOCIALS.slice(0, 3).map((s) => (
            <SocialChip key={s.l} s={s} onPress={() => onShareSocial(s)} />
          ))}
        </View>
        <View style={[styles.socialRow, { marginTop: 10, justifyContent: 'center' }]}>
          {SOCIALS.slice(3).map((s) => (
            <SocialChip key={s.l} s={s} onPress={() => onShareSocial(s)} />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SocialChip({ s, onPress }: { s: Social; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.socialChip, pressed && { opacity: 0.7 }]}>
      <View style={[styles.socialIcon, { backgroundColor: s.bg }]}>
        <Text style={[styles.socialEmoji, { color: s.ink ?? '#ffffff' }]}>{s.emoji}</Text>
      </View>
      <Text style={styles.socialText}>{s.l}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    borderRadius: 26,
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  qrDecoRing: { position: 'absolute', bottom: -60, left: -60 },

  qrTopBrand: { alignItems: 'center', marginBottom: 16 },
  qrBrandPill: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.bg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  qrBrandTagline: {
    marginTop: 6,
    fontFamily: fonts.displayItalic,
    fontSize: 12,
    color: colors.bg,
    opacity: 0.85,
  },

  qrFrame: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },

  url: { marginTop: 16, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.bg },
  urlSub: { marginTop: 4, fontSize: 12, color: colors.bg, opacity: 0.7, fontStyle: 'italic' },

  quickRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.1)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 6,
    minHeight: 64,
    justifyContent: 'center',
  },
  quickPrimary: { backgroundColor: colors.coral, borderColor: colors.coral },
  quickEmoji: { fontSize: 22 },
  quickText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },

  socialLabel: {
    marginTop: 24,
    fontFamily: fonts.displayItalic,
    fontSize: 13,
    color: colors.ink2,
    marginBottom: 12,
    textAlign: 'center',
  },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialChip: {
    flex: 1,
    maxWidth: '32%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.08)',
    backgroundColor: colors.surface,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  socialEmoji: { fontSize: 22, fontFamily: fonts.bodyBold },
  socialText: { fontFamily: fonts.displaySemiBold, fontSize: 11.5, color: colors.ink, textAlign: 'center' },
});
