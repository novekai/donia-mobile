// KYC — état + choix de pièce
// Si une soumission existe, on affiche son statut (PENDING / APPROVED / REJECTED).
// PENDING : "Vérification en cours" + bouton "Modifier ma soumission"
// APPROVED : "Vérification validée 🎉" — pas de re-soumission possible
// REJECTED : "Vérification refusée" + raison + bouton "Refaire une soumission"
// Sinon (jamais soumis) : flow normal de choix de pièce.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck, IconLock } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getLatestKyc } from '../../api/kyc';

type DocId = 'cni' | 'passport' | 'permis';

const DOCS: { id: DocId; l: string; sub: string; emoji: string; color: string }[] = [
  { id: 'cni', l: "Carte nationale d'identité", sub: 'Recto + verso', emoji: '🪪', color: colors.coral },
  { id: 'passport', l: 'Passeport', sub: 'Page photo seule', emoji: '📘', color: colors.indigo },
  { id: 'permis', l: 'Permis de conduire', sub: 'Recto + verso', emoji: '🚗', color: colors.mango },
];

const DOC_TYPE_LABEL: Record<'CNI' | 'PASSPORT' | 'PERMIS', string> = {
  CNI: "Carte nationale d'identité",
  PASSPORT: 'Passeport',
  PERMIS: 'Permis de conduire',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function KYCScreen({ navigation }: RootStackScreenProps<'KYC'>) {
  const [doc, setDoc] = useState<DocId>('cni');
  const kycQuery = useQuery({
    queryKey: ['kyc', 'latest'],
    queryFn: getLatestKyc,
    refetchOnMount: 'always',
  });

  const latest = kycQuery.data?.latest;
  const status = latest?.status ?? 'NONE';

  // === Cas 1 : Vérification validée ===
  if (status === 'APPROVED' && latest) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 32 }}>
          <View style={[styles.statusCard, { backgroundColor: 'rgba(92,138,69,0.10)', borderColor: 'rgba(92,138,69,0.35)' }]}>
            <View style={[styles.statusEmoji, { backgroundColor: colors.green }]}>
              <IconCheck size={28} color={colors.bg} strokeWidth={3.5} />
            </View>
            <Text style={styles.statusTitle}>Vérification validée 🎉</Text>
            <Text style={styles.statusSub}>
              Ton identité a été vérifiée le {formatDate(latest.createdAt)}. Tu peux maintenant utiliser toutes les fonctionnalités de Donia, dont les retraits Mobile Money.
            </Text>
            <View style={styles.statusMeta}>
              <Text style={styles.statusMetaLabel}>Pièce vérifiée</Text>
              <Text style={styles.statusMetaValue}>{DOC_TYPE_LABEL[latest.docType]}</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // === Cas 2 : Vérification en cours (PENDING) ===
  if (status === 'PENDING' && latest) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 32 }}>
          <View style={[styles.statusCard, { backgroundColor: 'rgba(255,199,0,0.12)', borderColor: 'rgba(255,199,0,0.35)' }]}>
            <View style={[styles.statusEmoji, { backgroundColor: colors.mango }]}>
              <Text style={{ fontSize: 24 }}>⏳</Text>
            </View>
            <Text style={styles.statusTitle}>Vérification en cours</Text>
            <Text style={styles.statusSub}>
              On vérifie ta pièce. Tu recevras une notification dès que c'est validé (sous 24-48h ouvrées).
            </Text>
            <View style={styles.statusMeta}>
              <Text style={styles.statusMetaLabel}>Pièce soumise</Text>
              <Text style={styles.statusMetaValue}>{DOC_TYPE_LABEL[latest.docType]}</Text>
              <Text style={styles.statusMetaLabel}>Soumise le</Text>
              <Text style={styles.statusMetaValue}>{formatDate(latest.createdAt)}</Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate('KYCUpload', {
                docType: latest.docType,
                existingRectoUrl: latest.docUrlRecto,
                existingVersoUrl: latest.docUrlVerso ?? undefined,
              })
            }
            style={styles.modifyBtn}
          >
            <Text style={styles.modifyBtnText}>✎ Modifier ma soumission</Text>
          </Pressable>
          <Text style={styles.modifyHint}>
            Tu peux remplacer les photos si elles étaient floues ou mal cadrées.
          </Text>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // === Cas 3 : Vérification refusée (REJECTED) ===
  if (status === 'REJECTED' && latest) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24 }}>
          <View style={[styles.statusCard, { backgroundColor: 'rgba(214,46,85,0.08)', borderColor: 'rgba(214,46,85,0.35)' }]}>
            <View style={[styles.statusEmoji, { backgroundColor: colors.coral }]}>
              <Text style={{ fontSize: 24 }}>✗</Text>
            </View>
            <Text style={[styles.statusTitle, { color: colors.coralDeep }]}>Vérification refusée</Text>
            <Text style={styles.statusSub}>
              Ta pièce n'a pas pu être vérifiée. Refais une soumission avec des photos nettes et bien cadrées.
            </Text>
          </View>

          {/* Re-choisir une pièce */}
          <Text style={styles.choiceTitle}>Refaire une soumission</Text>
          <DocPicker doc={doc} setDoc={setDoc} />

          <View style={styles.footer}>
            <Button
              label="Continuer"
              pulse
              onPress={() =>
                navigation.navigate('KYCUpload', {
                  docType: doc === 'cni' ? 'CNI' : doc === 'passport' ? 'PASSPORT' : 'PERMIS',
                })
              }
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // === Cas 4 : Première soumission (NONE / chargement) ===
  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />

      <View style={styles.bars}>
        <View style={[styles.bar, { backgroundColor: colors.coral }]} />
        <View style={[styles.bar, { backgroundColor: colors.coralSoft }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 130 }}>
        {kycQuery.isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        ) : (
          <>
            <Text style={styles.kicker}>Étape 1 sur 2 · Pièce d'identité</Text>
            <Text style={styles.title}>Choisis ta pièce 🪪</Text>
            <Text style={styles.subtitle}>
              Pour respecter les règles de paiement Mobile Money, on doit vérifier qui tu es. C'est rapide.
            </Text>

            <View style={{ marginTop: 22, gap: 10 }}>
              <DocPicker doc={doc} setDoc={setDoc} />
            </View>

            <View style={styles.privacy}>
              <IconLock color={colors.mint} />
              <Text style={styles.privacyText}>
                Tes documents sont chiffrés et stockés sous 7 jours. Personne d'autre que la vérification ne les voit.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {!kycQuery.isLoading && (
        <View style={styles.footer}>
          <Button
            label="Continuer"
            pulse
            onPress={() =>
              navigation.navigate('KYCUpload', {
                docType: doc === 'cni' ? 'CNI' : doc === 'passport' ? 'PASSPORT' : 'PERMIS',
              })
            }
          />
        </View>
      )}
    </ScreenContainer>
  );
}

function DocPicker({ doc, setDoc }: { doc: DocId; setDoc: (d: DocId) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {DOCS.map((d) => {
        const on = d.id === doc;
        return (
          <Pressable
            key={d.id}
            onPress={() => setDoc(d.id)}
            style={[styles.opt, on && { borderWidth: 2, borderColor: d.color }]}
          >
            <View style={[styles.optIcon, { backgroundColor: `${d.color}22` }]}>
              <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optTitle}>{d.l}</Text>
              <Text style={styles.optSub}>{d.sub}</Text>
            </View>
            <View style={[styles.radio, on && { backgroundColor: d.color, borderWidth: 0 }]}>
              {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { marginHorizontal: 22, marginTop: 14, flexDirection: 'row', gap: 5 },
  bar: { flex: 1, height: 4, borderRadius: 99 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink2, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { marginTop: 6, fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5, lineHeight: 28 },
  subtitle: { marginTop: 6, fontSize: 13, color: colors.ink2, lineHeight: 19 },
  opt: { padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  optSub: { fontSize: 12, color: colors.ink2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
  privacy: { marginTop: 22, padding: 14, borderRadius: 14, backgroundColor: 'rgba(93,191,160,0.12)', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  privacyText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },

  statusCard: { padding: 22, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', gap: 10 },
  statusEmoji: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { marginTop: 6, fontFamily: fonts.displayMedium, fontSize: 22, color: colors.ink, textAlign: 'center', letterSpacing: -0.4 },
  statusSub: { fontSize: 13, color: colors.ink2, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  statusMeta: { marginTop: 14, width: '100%', padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.6)' },
  statusMetaLabel: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink2, marginTop: 6 },
  statusMetaValue: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink, marginTop: 2 },

  modifyBtn: { marginTop: 18, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.coral, backgroundColor: colors.surface, alignItems: 'center' },
  modifyBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.coral },
  modifyHint: { marginTop: 8, fontSize: 11, color: colors.ink3, textAlign: 'center', fontStyle: 'italic' },

  choiceTitle: { marginTop: 22, marginBottom: 12, fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
});
