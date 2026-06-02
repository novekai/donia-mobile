// Profile V2 — hub utilisateur, calé sur la maquette Direction C v2
// Banner indigo plein avec avatar à gauche, compteurs intégrés, 3 groupes d'actions.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { IconArrowL, IconChevR, IconCamera, IconLogout } from '../../components/ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps, RootStackParams } from '../../navigation/types';
import { getMe, uploadAvatar, deleteAvatar } from '../../api/me';
import { getReferral } from '../../api/referral';
import { listTransactions } from '../../api/transactions';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

type ScreenName = keyof RootStackParams;

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return n.toString();
}

type Row = { label: string; sub: string; emoji: string; color: string; badge?: string; route?: ScreenName };
type Group = { items: Row[] };

export function ProfileScreen({ navigation }: RootStackScreenProps<'Profile'>) {
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const refQuery = useQuery({ queryKey: ['referral'], queryFn: getReferral });
  const sentQuery = useQuery({
    queryKey: ['transactions', 'profile-sent'],
    queryFn: () => listTransactions({ type: 'SEND', limit: 50 }),
    select: (d) => d.items.length,
  });
  const receivedQuery = useQuery({
    queryKey: ['transactions', 'profile-received'],
    queryFn: () => listTransactions({ type: 'RECEIVE', limit: 50 }),
    select: (d) => d.items.length,
  });

  const storedUser = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const user = meQuery.data?.user ?? storedUser;
  const firstName = user?.name?.split(' ')[0] ?? 'Toi';
  const initial = (firstName[0] ?? 'D').toUpperCase();
  const avatarUrl = (user && 'avatarUrl' in user ? user.avatarUrl : null) as string | null | undefined;
  const referralCode = (user && 'referralCode' in user ? user.referralCode : null) ?? '—';
  const balance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);
  const sentCount = sentQuery.data ?? 0;
  const receivedCount = receivedQuery.data ?? 0;
  const referralEarned = refQuery.data?.totalEarned ?? 0;
  const referralCount = refQuery.data?.filleulsCount ?? 0;

  function onLogout() {
    Alert.alert('Se déconnecter ?', 'Tu pourras revenir avec ton numéro et ton mot de passe.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          signOut();
          queryClient.clear();
        },
      },
    ]);
  }

  async function pickAndUpload(source: 'camera' | 'library') {
    try {
      const perm = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission refusée', 'Autorise Donia à accéder à ' + (source === 'camera' ? 'la caméra' : 'tes photos') + ' dans les réglages.');
        return;
      }
      const picker = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await picker({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled || !result.assets[0]) return;
      setUploading(true);
      const asset = result.assets[0];
      const resized = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      await uploadAvatar(resized.uri);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      console.warn('avatar upload failed', e);
      Alert.alert('Upload échoué', getApiErrorMessage(e) || String(e));
    } finally {
      setUploading(false);
    }
  }

  function onChangePhoto() {
    const buttons: Array<{ text: string; onPress: () => void; style?: 'cancel' | 'destructive' }> = [
      { text: 'Prendre une photo', onPress: () => pickAndUpload('camera') },
      { text: 'Choisir dans la galerie', onPress: () => pickAndUpload('library') },
    ];
    if (avatarUrl) {
      buttons.push({
        text: 'Supprimer la photo',
        style: 'destructive',
        onPress: async () => {
          try {
            setUploading(true);
            await deleteAvatar();
            queryClient.invalidateQueries({ queryKey: ['me'] });
          } catch (e) {
            Alert.alert('Erreur', getApiErrorMessage(e));
          } finally {
            setUploading(false);
          }
        },
      });
    }
    buttons.push({ text: 'Annuler', style: 'cancel', onPress: () => {} });
    Alert.alert('Photo de profil', 'Choisis comment changer ta photo', buttons);
  }

  const groups: Group[] = [
    { items: [
      { label: 'Mon solde', sub: `${balance.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`, emoji: '💰', color: colors.mango, route: 'Wallet' },
      { label: 'Notifications', sub: 'Cartes reçues · paiements', emoji: '🔔', color: colors.coral, route: 'Notifications' },
    ]},
    { items: [
      { label: 'Mes cartes envoyées', sub: `${sentCount} carte${sentCount > 1 ? 's' : ''}`, emoji: '📤', color: colors.indigo, route: 'History' as ScreenName },
      { label: 'Cartes reçues', sub: `${receivedCount} carte${receivedCount > 1 ? 's' : ''}`, emoji: '📥', color: colors.pink, route: 'History' as ScreenName },
      { label: 'Parrainage',
        sub: referralCount > 0
          ? `${referralCount} filleul${referralCount > 1 ? 's' : ''} · ${referralEarned.toLocaleString('fr-FR')} FCFA gagnés`
          : '1 % à vie · invite tes amis',
        emoji: '🎁', color: colors.mint, route: 'Referral' },
    ]},
    { items: [
      { label: 'Sécurité', sub: 'Mot de passe · biométrie', emoji: '🔒', color: colors.plum, route: 'Security' },
      { label: 'Paramètres', sub: 'Confidentialité · langue · anniversaire', emoji: '⚙️', color: colors.ink2, route: 'Settings' },
      { label: 'Aide & support', sub: 'FAQ · nous contacter', emoji: '💬', color: colors.indigo },
    ]},
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Indigo banner */}
        <BrandGradient variant="indigo" style={styles.banner}>
          <View pointerEvents="none" style={styles.bannerDeco}>
            <ConcentricRings size={180} color={colors.mango} opacity={0.18} anim="spin" />
          </View>

          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IconArrowL size={16} color={colors.bg} />
          </Pressable>

          <View style={styles.bannerRow}>
            <Pressable onPress={onChangePhoto} disabled={uploading} style={{ position: 'relative' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <BrandGradient variant="coral" style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{initial}</Text>
                </BrandGradient>
              )}
              {uploading && (
                <View style={[styles.avatar, styles.uploadingOverlay]}>
                  <ActivityIndicator color={colors.bg} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <IconCamera size={13} color={colors.bg} strokeWidth={2.2} />
              </View>
            </Pressable>
            <View style={{ flex: 1, marginLeft: 16, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>{user?.name ?? '—'}</Text>
              <Text style={styles.referral}>Code parrain · {referralCode}</Text>
            </View>
          </View>

          {/* Counters trio in banner */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{receivedCount}</Text>
              <Text style={styles.statLabel}>REÇUES</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{sentCount}</Text>
              <Text style={styles.statLabel}>ENVOYÉES</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{fmtCount(balance)}</Text>
              <Text style={styles.statLabel}>FCFA</Text>
            </View>
          </View>
        </BrandGradient>

        {/* Groups */}
        <View style={styles.body}>
          {groups.map((g, gi) => (
            <View key={gi} style={styles.group}>
              {g.items.map((it, i) => (
                <Pressable
                  key={it.label}
                  onPress={() => it.route && navigation.navigate(it.route as never)}
                  style={[styles.row, i < g.items.length - 1 && styles.rowDivider]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: `${it.color}22` }]}>
                    <Text style={{ fontSize: 18 }}>{it.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>{it.label}</Text>
                    <Text style={styles.itemSub}>{it.sub}</Text>
                  </View>
                  {it.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{it.badge}</Text>
                    </View>
                  )}
                  <IconChevR color={colors.ink3} />
                </Pressable>
              ))}
            </View>
          ))}

          <Pressable onPress={onLogout} style={styles.logoutBtn}>
            <IconLogout color={colors.coralDeep} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 22, paddingTop: 50, paddingBottom: 26, position: 'relative', overflow: 'hidden' },
  bannerDeco: { position: 'absolute', top: -40, right: -40 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(253,247,246,0.18)', borderWidth: 1, borderColor: 'rgba(253,247,246,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: fonts.displayMedium, fontSize: 30, color: colors.bg },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(42,15,26,0.6)' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.mango, borderWidth: 2.5, borderColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.bg, letterSpacing: -0.4 },
  referral: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.bg, opacity: 0.75, marginTop: 2, letterSpacing: 0.4 },
  statsRow: { marginTop: 20, flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: 'rgba(253,247,246,0.1)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(253,247,246,0.12)' },
  statValue: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.bg, letterSpacing: -0.4 },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.mango, marginTop: 2, letterSpacing: 0.4 },
  body: { paddingHorizontal: 18, paddingTop: 18, gap: 14 },
  group: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(42,15,26,0.06)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(42,15,26,0.06)' },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  itemSub: { fontSize: 11, color: colors.ink3, marginTop: 1 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.coral, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.bg },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(232,60,90,0.25)', backgroundColor: 'transparent' },
  logoutText: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.coralDeep },
});
