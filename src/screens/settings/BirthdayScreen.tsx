// Birthday — paramètres visibilite + notifs + carte auto + note.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe, updateMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

type Visibility = 'public' | 'contacts' | 'private';

const VISIBILITY_OPTIONS: { key: Visibility; label: string }[] = [
  { key: 'public', label: 'Tout le monde' },
  { key: 'contacts', label: 'Mes contacts' },
  { key: 'private', label: 'Personne' },
];

export function BirthdayScreen({ navigation }: RootStackScreenProps<'Birthday'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);
  const [noteDraft, setNoteDraft] = React.useState<string | null>(null);
  const [noteFocus, setNoteFocus] = React.useState(false);

  const user = meQuery.data?.user;
  const optIn = Boolean(user?.birthdayOptIn ?? true);
  const pub = Boolean(user?.birthdayPublic ?? false);
  const showAge = Boolean(user?.birthdayShowAge ?? true);
  const autoCard = Boolean(user?.birthdayAutoCard ?? false);
  const visibility: Visibility = (user?.birthdayVisibility ?? 'contacts') as Visibility;
  const dob = user?.dob ?? null;
  const note = user?.birthdayNote ?? '';

  async function patch(data: Record<string, unknown>, busyKey: string) {
    if (busy) return;
    setBusy(busyKey);
    try {
      await updateMe(data as never);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      Alert.alert('Erreur', getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  function onSaveNote() {
    if (noteDraft === null) return;
    const trimmed = noteDraft.trim();
    if (trimmed === note) {
      setNoteDraft(null);
      setNoteFocus(false);
      return;
    }
    patch({ birthdayNote: trimmed.length ? trimmed : null }, 'birthdayNote').then(() => {
      setNoteDraft(null);
      setNoteFocus(false);
    });
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Anniversaire 🎂" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {user && (
          <>
            {/* Carte info */}
            <Card>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 36 }}>🎂</Text>
                <Text style={styles.heroTitle}>Le jour J, sois (ou non) visible</Text>
                <Text style={styles.heroSub}>
                  Contrôle si les autres te voient dans la liste « Fêtes » le jour de ton anniversaire.
                </Text>
              </View>
            </Card>

            {/* Toggle : visible dans les Fêtes */}
            <Toggle
              icon="🎉"
              title="Être visible dans les Fêtes le jour J"
              sub="Les autres utilisateurs te verront"
              value={pub}
              busy={busy === 'birthdayPublic'}
              onChange={(v) => patch({ birthdayPublic: v }, 'birthdayPublic')}
            />

            {/* Toggle : afficher mon âge */}
            <Toggle
              icon="🎈"
              title="Afficher mon âge"
              sub="Visible sur ton profil public"
              value={showAge}
              busy={busy === 'birthdayShowAge'}
              onChange={(v) => patch({ birthdayShowAge: v }, 'birthdayShowAge')}
            />

            {/* Toggle : notifs */}
            <Toggle
              icon="🔔"
              title="Notifs anniversaires de mes contacts"
              sub="Être prévenu pour offrir une carte"
              value={optIn}
              busy={busy === 'birthdayOptIn'}
              onChange={(v) => patch({ birthdayOptIn: v }, 'birthdayOptIn')}
            />

            {/* Toggle : carte automatique */}
            <Toggle
              icon="💝"
              iconBg={'rgba(249,160,28,0.18)'}
              title="Carte d'anniversaire automatique Donia"
              sub={`Donia offre une carte de ${user.birthdayAutoCardAmount ?? 500} FCFA chaque année`}
              value={autoCard}
              busy={busy === 'birthdayAutoCard'}
              onChange={(v) => patch({ birthdayAutoCard: v }, 'birthdayAutoCard')}
            />

            {/* Sélecteur visibilité */}
            <Text style={styles.sectionLabel}>Qui peut me voir ?</Text>
            <View style={styles.visibilityRow}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const on = visibility === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => patch({ birthdayVisibility: opt.key }, 'birthdayVisibility')}
                    style={[styles.visBtn, on && styles.visBtnActive]}
                    disabled={busy === 'birthdayVisibility'}
                  >
                    <Text style={[styles.visBtnText, on && styles.visBtnTextActive]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Champ "Ma note pour mon anniversaire" */}
            <Text style={styles.sectionLabel}>Ma note pour mon anniversaire</Text>
            <View style={[styles.noteWrap, noteFocus && { borderColor: colors.coral }]}>
              <TextInput
                value={noteDraft ?? note}
                onChangeText={setNoteDraft}
                onFocus={() => setNoteFocus(true)}
                onBlur={onSaveNote}
                placeholder="Dis à tes proches ce que tu aimes (cafés, musique, hobbies...)"
                placeholderTextColor={colors.ink3}
                multiline
                maxLength={280}
                style={styles.noteInput}
              />
              <Text style={styles.noteCount}>
                {(noteDraft ?? note).length}/280
              </Text>
            </View>
            <Text style={styles.noteHint}>
              💡 Affichée sur ton profil public le jour de ton anniversaire pour aider tes proches à te faire plaisir.
            </Text>

            {/* Date naissance */}
            <View style={styles.dobCard}>
              <Text style={styles.dobLabel}>Ta date de naissance</Text>
              {dob ? (
                <Text style={styles.dobValue}>
                  {new Date(dob).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              ) : (
                <Pressable onPress={() => navigation.navigate('MyInfo')}>
                  <Text style={[styles.dobValue, { color: colors.coralDeep }]}>+ Ajouter ma date de naissance</Text>
                </Pressable>
              )}
              <Text style={styles.dobHint}>Verrouillée après l'inscription pour des raisons de sécurité.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function Toggle({ icon, iconBg, title, sub, value, busy, onChange }: {
  icon: string;
  iconBg?: string;
  title: string;
  sub: string;
  value: boolean;
  busy: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} disabled={busy} style={{ marginTop: 10 }}>
      <Card pad={0}>
        <View style={styles.row}>
          <View style={[styles.iconBox, iconBg ? { backgroundColor: iconBg } : null]}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{title}</Text>
            <Text style={styles.sub}>{sub}</Text>
          </View>
          <View style={[styles.toggle, value && { backgroundColor: colors.coral }]}>
            <View style={[styles.toggleDot, { left: value ? 22 : 2 }]} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroTitle: { marginTop: 10, fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink, textAlign: 'center' },
  heroSub: { marginTop: 6, fontSize: 12, color: colors.ink2, lineHeight: 18, textAlign: 'center', fontFamily: fonts.bodyRegular },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 11, color: colors.ink3, marginTop: 3, lineHeight: 15 },
  toggle: { width: 46, height: 26, borderRadius: 99, backgroundColor: colors.ink3, justifyContent: 'center' },
  toggleDot: { position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg },

  sectionLabel: { marginTop: 18, marginBottom: 8, fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  visibilityRow: { flexDirection: 'row', gap: 6 },
  visBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center' },
  visBtnActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  visBtnText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  visBtnTextActive: { color: colors.bg },

  noteWrap: { borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, padding: 12, minHeight: 90 },
  noteInput: { fontSize: 14, color: colors.ink, fontFamily: fonts.bodyRegular, lineHeight: 20, minHeight: 60 },
  noteCount: { alignSelf: 'flex-end', fontSize: 10, color: colors.ink3, marginTop: 4 },
  noteHint: { marginTop: 6, fontSize: 11, color: colors.ink3, lineHeight: 15, fontStyle: 'italic' },

  dobCard: { marginTop: 22, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,199,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,199,0,0.3)' },
  dobLabel: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  dobValue: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.ink },
  dobHint: { marginTop: 8, fontSize: 11, color: colors.ink2, lineHeight: 16, fontFamily: fonts.bodyRegular },
});
