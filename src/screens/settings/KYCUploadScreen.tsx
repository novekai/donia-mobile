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
  const existingRectoUrl = route.params?.existingRectoUrl ?? null;
  const existingVersoUrl = route.params?.existingVersoUrl ?? null;
  const isEditing = Boolean(existingRectoUrl);

  // Recto et verso peuvent être :
  // - null : pas de photo (premier upload)
  // - une URI locale (file://) si l'utilisateur a pris une nouvelle photo
  // - l'URL R2 existante (https://) si on a chargé une soumission antérieure
  const [rectoUri, setRectoUri] = useState<string | null>(existingRectoUrl);
  const [versoUri, setVersoUri] = useState<string | null>(existingVersoUrl);
  const [submitting, setSubmitting] = useState(false);

  // Verso toujours optionnel (certaines pièces n'ont pas de verso).
  // Le recto seul suffit pour soumettre.
  const canSubmit = Boolean(rectoUri);

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

  // Détermine si une URI locale doit être uploadée (file://) ou si c'est déjà
  // une URL R2 existante (https://) à conserver telle quelle.
  function isLocalUri(uri: string | null): boolean {
    if (!uri) return false;
    return !uri.startsWith('http');
  }

  async function onSubmit() {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      // Recto : upload seulement si nouvelle photo, sinon garde l'URL existante
      const rectoUrl = isLocalUri(rectoUri) ? (await uploadKycImage(rectoUri!, 'recto')).url : rectoUri!;
      // Verso : pareil. Optionnel.
      let versoUrl: string | undefined;
      if (versoUri) {
        versoUrl = isLocalUri(versoUri) ? (await uploadKycImage(versoUri, 'verso')).url : versoUri;
      }
      await submitKyc({ docType, docUrlRecto: rectoUrl, docUrlVerso: versoUrl });
      Alert.alert(
        isEditing ? 'Soumission mise à jour ✨' : 'Vérification soumise 🎉',
        isEditing
          ? "On va re-vérifier ta pièce sous 24-48h."
          : "On va vérifier ta pièce sous 24-48h. Tu recevras une notification dès que c'est validé.",
        [{
          text: 'OK',
          onPress: () => {
            // Retour propre vers Paramètres (pas popToTop qui sortait du flux auth)
            navigation.navigate('Settings');
          },
        }],
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
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 130 }}>
        <Text style={styles.kicker}>{isEditing ? 'Modifier ma soumission' : 'Étape 2 sur 2 · Photos'}</Text>
        <Text style={styles.title}>{isEditing ? 'Remplacer mes photos 📸' : 'Photographie ta pièce 📸'}</Text>
        <Text style={styles.subtitle}>
          Cadre bien {DOC_LABEL[docType]}, sans flash ni reflet. Les 4 coins doivent être visibles.
          {isEditing ? ' Touche "Changer" sur les photos déjà soumises pour les remplacer.' : ''}
        </Text>

        <Slot
          label="Recto"
          uri={rectoUri}
          onCamera={() => takePhoto('recto')}
          onGallery={() => pickImage('recto')}
          onRemove={() => setRectoUri(null)}
        />

        <Slot
          label="Verso (optionnel)"
          uri={versoUri}
          onCamera={() => takePhoto('verso')}
          onGallery={() => pickImage('verso')}
          onRemove={() => setVersoUri(null)}
        />

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
