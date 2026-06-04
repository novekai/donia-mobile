// KYC Upload — étape 2 du flow KYC : prendre / choisir les photos du document
// (recto + verso si CNI/permis, recto seul si passeport) puis soumettre.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconLock } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { uploadKycImage, submitKyc, type KycDocType } from '../../api/kyc';
import { getApiErrorMessage } from '../../api/client';

const DOC_LABEL: Record<KycDocType, string> = {
  CNI: "Carte nationale d'identité",
  PASSPORT: 'Passeport',
  PERMIS: 'Permis de conduire',
};

export function KYCUploadScreen({ navigation, route }: RootStackScreenProps<'KYCUpload'>) {
  const docType = route.params?.docType ?? 'CNI';
  const needsVerso = docType !== 'PASSPORT';

  const [rectoUri, setRectoUri] = useState<string | null>(null);
  const [versoUri, setVersoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(rectoUri) && (!needsVerso || Boolean(versoUri));

  async function pickImage(side: 'recto' | 'verso') {
    // Permission d'accès aux médias
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', "Donia a besoin d'accéder à tes photos pour ta pièce d'identité.");
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (r.canceled || !r.assets?.[0]) return;
    const uri = r.assets[0].uri;
    if (side === 'recto') setRectoUri(uri);
    else setVersoUri(uri);
  }

  async function takePhoto(side: 'recto' | 'verso') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', "Donia a besoin de la caméra pour photographier ta pièce.");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      quality: 0.9,
    });
    if (r.canceled || !r.assets?.[0]) return;
    const uri = r.assets[0].uri;
    if (side === 'recto') setRectoUri(uri);
    else setVersoUri(uri);
  }

  async function onSubmit() {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const recto = await uploadKycImage(rectoUri!, 'recto');
      let versoUrl: string | undefined;
      if (needsVerso && versoUri) {
        const verso = await uploadKycImage(versoUri, 'verso');
        versoUrl = verso.url;
      }
      await submitKyc({ docType, docUrlRecto: recto.url, docUrlVerso: versoUrl });
      Alert.alert(
        'Vérification soumise 🎉',
        "On va vérifier ta pièce sous 24-48h. Tu recevras une notification dès que c'est validé.",
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
      );
    } catch (e) {
      Alert.alert('Échec de la soumission', getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />

      <View style={styles.bars}>
        <View style={[styles.bar, { backgroundColor: colors.coral }]} />
        <View style={[styles.bar, { backgroundColor: colors.coral }]} />
        <View style={[styles.bar, { backgroundColor: colors.coralSoft }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 130 }}>
        <Text style={styles.kicker}>Étape 2 sur 3 · Photos</Text>
        <Text style={styles.title}>Photographie ta pièce 📸</Text>
        <Text style={styles.subtitle}>
          Cadre bien {DOC_LABEL[docType]}, sans flash ni reflet. Les 4 coins doivent être visibles.
        </Text>

        <Slot
          label={needsVerso ? 'Recto' : 'Page photo'}
          uri={rectoUri}
          onCamera={() => takePhoto('recto')}
          onGallery={() => pickImage('recto')}
          onRemove={() => setRectoUri(null)}
        />

        {needsVerso && (
          <Slot
            label="Verso"
            uri={versoUri}
            onCamera={() => takePhoto('verso')}
            onGallery={() => pickImage('verso')}
            onRemove={() => setVersoUri(null)}
          />
        )}

        <View style={styles.privacy}>
          <IconLock color={colors.mint} />
          <Text style={styles.privacyText}>
            Tes documents sont chiffrés en transit et supprimés après vérification. Personne ne les voit sauf l'équipe vérification.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Envoi…' : 'Soumettre ma pièce'}
          pulse
          disabled={!canSubmit || submitting}
          onPress={onSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

function Slot({
  label,
  uri,
  onCamera,
  onGallery,
  onRemove,
}: {
  label: string;
  uri: string | null;
  onCamera: () => void;
  onGallery: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.slotLabel}>{label}</Text>
      {uri ? (
        <View style={styles.slotFilled}>
          <Image source={{ uri }} style={styles.slotImage} resizeMode="cover" />
          <Pressable onPress={onRemove} style={styles.slotRemove}>
            <Text style={styles.slotRemoveText}>Changer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.slotEmpty}>
          <Pressable onPress={onCamera} style={[styles.slotBtn, { backgroundColor: colors.coral }]}>
            <Text style={[styles.slotBtnText, { color: colors.bg }]}>📷  Prendre une photo</Text>
          </Pressable>
          <Pressable onPress={onGallery} style={styles.slotBtnGhost}>
            <Text style={styles.slotBtnGhostText}>🖼️  Depuis la galerie</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { marginHorizontal: 22, marginTop: 14, flexDirection: 'row', gap: 5 },
  bar: { flex: 1, height: 4, borderRadius: 99 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink2, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { marginTop: 6, fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5, lineHeight: 28 },
  subtitle: { marginTop: 6, fontSize: 13, color: colors.ink2, lineHeight: 19 },
  slotLabel: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink, marginBottom: 8 },
  slotEmpty: { gap: 8 },
  slotBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  slotBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 14 },
  slotBtnGhost: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  slotBtnGhostText: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  slotFilled: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  slotImage: { width: '100%', aspectRatio: 4 / 3 },
  slotRemove: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.lineSoft },
  slotRemoveText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coralDeep },
  privacy: { marginTop: 22, padding: 14, borderRadius: 14, backgroundColor: 'rgba(93,191,160,0.12)', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  privacyText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
