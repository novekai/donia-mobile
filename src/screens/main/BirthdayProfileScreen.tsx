// BirthdayProfile — profil d'une personne qui fete son anniversaire
// Header gradient + avatar + note + 2 actions (offrir un cadeau / message anonyme).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { Button } from '../../components/ui/Button';
import { IconChevL } from '../../components/ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getBirthdayProfile } from '../../api/birthdays';
import { getApiErrorMessage } from '../../api/client';

const DAY_LABEL: Record<'today' | 'tomorrow' | 'after', string> = {
  today: "Anniversaire aujourd'hui",
  tomorrow: 'Anniversaire demain',
  after: 'Anniversaire après-demain',
};

export function BirthdayProfileScreen({ navigation, route }: RootStackScreenProps<'BirthdayProfile'>) {
  const { userId } = route.params;
  const query = useQuery({
    queryKey: ['birthday-profile', userId],
    queryFn: () => getBirthdayProfile(userId),
  });

  const p = query.data?.person;

  function onSendCard() {
    if (!p) return;
    navigation.navigate('SendAmount', {
      categoryKey: 'anniv',
      recipientPhone: p.phone,
      recipientName: p.name,
    });
  }

  function onSendAnonymousMessage() {
    Alert.alert(
      'Bientôt disponible',
      "L'envoi de messages anonymes vers un autre utilisateur Donia sera disponible dans une prochaine version. En attendant, tu peux créer ton propre lien anonyme depuis l'onglet Anonymes.",
    );
  }

  return (
    <ScreenContainer dark>
      {query.isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
          <ActivityIndicator color={colors.coral} />
        </View>
      )}

      {query.isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.coralDeep, textAlign: 'center' }}>
            {getApiErrorMessage(query.error)}
          </Text>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18 }}>
            <Text style={{ color: colors.indigo, fontFamily: fonts.displaySemiBold }}>← Retour</Text>
          </Pressable>
        </View>
      )}

      {p && (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Header gradient avec avatar */}
          <BrandGradient variant={p.variant === 'plum' ? 'indigo' : p.variant} style={styles.hero}>
            <View pointerEvents="none" style={{ position: 'absolute', top: -50, right: -40, opacity: 0.35 }}>
              <ConcentricRings size={180} color={colors.mango} opacity={0.45} anim="spin" />
            </View>
            <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 80, left: 60 }} />
            <Sparkle size={10} color={colors.bg} style={{ position: 'absolute', top: 130, right: 80 }} />

            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <IconChevL size={20} color={colors.bg} />
            </Pressable>

            <View style={styles.avatarOuter}>
              {p.avatarUrl ? (
                <Image source={{ uri: p.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 44, fontFamily: fonts.displaySemiBold, color: colors.coral }}>{p.initial}</Text>
                </View>
              )}
            </View>

            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.subtitle}>
              🎉 {DAY_LABEL[p.day ?? 'today']}
              {p.age !== null && `  ·  ${p.age} ans`}
            </Text>
          </BrandGradient>

          {/* Note */}
          <View style={{ paddingHorizontal: 22, marginTop: -28 }}>
            <View style={[styles.noteCard, shadow.indigo]}>
              <Text style={styles.noteLabel}>SA NOTE</Text>
              {p.note ? (
                <Text style={styles.noteText}>« {p.note} »</Text>
              ) : (
                <Text style={[styles.noteText, { fontStyle: 'italic', color: colors.ink3 }]}>
                  Aucune note partagée pour l’instant.
                </Text>
              )}

              <View style={styles.privacyBox}>
                <Text style={{ fontSize: 13 }}>🔒</Text>
                <Text style={styles.privacyText}>
                  Email et téléphone masqués · l’envoi se fait dans Donia
                </Text>
              </View>

              {p.friendsInCommon > 0 && (
                <View style={styles.friendsBox}>
                  <Text style={styles.friendsText}>
                    👥 {p.friendsInCommon} {p.friendsInCommon === 1 ? 'ami en commun' : 'amis en commun'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={{ paddingHorizontal: 22, marginTop: 28, gap: 10 }}>
            <Button
              label="🎁 Offrir un cadeau d'anniversaire"
              pulse
              shimmer
              onPress={onSendCard}
            />
            <Pressable onPress={onSendAnonymousMessage} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>💌 Lui envoyer un message anonyme</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 30, paddingHorizontal: 22, paddingBottom: 60, alignItems: 'center', overflow: 'hidden' },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },

  avatarOuter: { width: 140, height: 140, borderRadius: 70, padding: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginTop: 8 },
  avatar: { width: 132, height: 132, borderRadius: 66 },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 26, color: colors.bg, marginTop: 14, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { marginTop: 6, fontFamily: fonts.displayItalic, fontSize: 13, color: colors.bg, opacity: 0.92 },

  noteCard: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.lineSoft },
  noteLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.2 },
  noteText: { marginTop: 8, fontSize: 14, color: colors.ink, lineHeight: 22, fontFamily: fonts.bodyRegular },

  privacyBox: { marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: 'rgba(93,191,160,0.12)', borderWidth: 1, borderColor: 'rgba(93,191,160,0.25)', flexDirection: 'row', alignItems: 'center', gap: 7 },
  privacyText: { flex: 1, fontSize: 12, color: colors.green, fontFamily: fonts.bodyMedium },

  friendsBox: { marginTop: 10, padding: 8, borderRadius: 10, backgroundColor: 'rgba(65,8,123,0.07)', alignItems: 'center' },
  friendsText: { fontSize: 12, color: colors.indigo, fontFamily: fonts.bodyMedium },

  secondaryBtn: { paddingVertical: 14, borderRadius: radius.md, backgroundColor: 'rgba(65,8,123,0.08)', borderWidth: 1, borderColor: 'rgba(65,8,123,0.18)', alignItems: 'center' },
  secondaryBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.indigo },
});
