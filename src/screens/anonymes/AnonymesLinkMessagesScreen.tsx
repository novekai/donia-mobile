// AnonymesLinkMessages — messages reçus pour UN lien anonyme spécifique.
// On atterrit ici depuis AnonymesScreen quand on tape sur un lien de la liste.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Share, Alert, Clipboard, Linking } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { IconAnonyme } from '../../components/ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { listAnonymousMessages } from '../../api/anonymes';
import type { AnonymousMessage } from '../../api/types';

const SHARE_URL_BASE = 'https://doniia.com/a';

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'hier';
  return `il y a ${Math.floor(diff / 86400)} j`;
}

const MSG_COLORS = [colors.coral, colors.indigo, colors.mango, colors.pink, colors.plum, colors.mint];
function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return MSG_COLORS[Math.abs(h) % MSG_COLORS.length];
}

export function AnonymesLinkMessagesScreen({ navigation, route }: RootStackScreenProps<'AnonymesLinkMessages'>) {
  const { t } = useTranslation();
  const { linkId, code, prompt } = route.params;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['anon-messages', linkId],
    queryFn: () => listAnonymousMessages({ linkId, limit: 50 }),
  });

  const messages: AnonymousMessage[] = query.data?.items ?? [];
  const url = `${SHARE_URL_BASE}/${code}`;

  async function onCopy() {
    Clipboard.setString(url);
    Alert.alert(t('referral.linkCopiedTitle'), url);
  }

  async function onShare() {
    const deepLink = `whatsapp://send?text=${encodeURIComponent(`${prompt}\n${url}`)}`;
    try {
      const ok = await Linking.canOpenURL(deepLink);
      if (ok) {
        await Linking.openURL(deepLink);
        return;
      }
    } catch {}
    try {
      await Share.share({ message: `${prompt}\n${url}` });
    } catch {}
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={`« ${prompt} »`} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['anon-messages', linkId] })}
            tintColor={colors.coral}
          />
        }
      >
        <BrandGradient variant="indigo" style={[styles.headerCard, shadow.indigo]}>
          <Text style={styles.headerLabel}>{t('anonymes.linkLabel')}</Text>
          <Text style={styles.headerUrl}>
            doniia.com/a/<Text style={{ color: colors.mango }}>{code}</Text>
          </Text>
          <View style={styles.headerActions}>
            <Pressable onPress={onCopy} style={[styles.headerBtn, { backgroundColor: 'rgba(253,247,246,0.14)' }]}>
              <Text style={styles.headerBtnText}>📋 {t('common.copy')}</Text>
            </Pressable>
            <Pressable onPress={onShare} style={[styles.headerBtn, { backgroundColor: colors.mango }]}>
              <Text style={[styles.headerBtnText, { color: colors.indigoDeep }]}>💬 {t('common.share')}</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AnonymesLink', { code })}
              style={[styles.headerBtn, { backgroundColor: 'rgba(253,247,246,0.14)' }]}
            >
              <Text style={styles.headerBtnText}>🖼️ QR</Text>
            </Pressable>
          </View>
        </BrandGradient>

        <View style={styles.msgsHead}>
          <Text style={styles.msgsTitle}>{t('anonymes.msgsTitle')}</Text>
          <Text style={styles.msgsCount}>
            {messages.length === 0 ? t('anonymes.msgsNoneShort') : t('anonymes.msgsCount', { count: messages.length })}
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💌</Text>
            <Text style={styles.emptyTitle}>{t('anonymes.msgsEmptyTitle')}</Text>
            <Text style={styles.emptySub}>{t('anonymes.msgsEmptyBody')}</Text>
          </View>
        ) : (
          <View style={{ gap: 9 }}>
            {messages.map((m) => {
              const c = colorFor(m.id);
              return (
                <Pressable
                  key={m.id}
                  onPress={() => navigation.navigate('AnonymesRead', { messageId: m.id })}
                  style={styles.msgCard}
                >
                  <View style={[styles.msgStripe, { backgroundColor: c }]} />
                  <View style={styles.msgHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconAnonyme size={13} color={c} />
                      <Text style={[styles.msgTagAnon, { color: c }]}>{t('anonymes.anonTag')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {m.isFavorite && <Text style={styles.msgFav}>❤</Text>}
                      <Text style={styles.msgDate}>{relativeTime(m.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={styles.msgContent} numberOfLines={3}>
                    {m.content}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: { borderRadius: 18, padding: 16, overflow: 'hidden' },
  headerLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mango, letterSpacing: 1.2 },
  headerUrl: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.bg },
  headerActions: { marginTop: 14, flexDirection: 'row', gap: 8 },
  headerBtn: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  headerBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.bg },

  msgsHead: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  msgsTitle: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink, letterSpacing: -0.2 },
  msgsCount: { fontSize: 12, color: colors.ink3, fontStyle: 'italic' },

  emptyCard: { padding: 28, alignItems: 'center', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18 },

  msgCard: { padding: 13, paddingLeft: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(42,15,26,0.06)', position: 'relative', overflow: 'hidden' },
  msgStripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4 },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, paddingLeft: 4 },
  msgTagAnon: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.5 },
  msgFav: { fontSize: 13, color: colors.coral },
  msgDate: { fontSize: 11, color: colors.ink3, fontStyle: 'italic' },
  msgContent: { fontSize: 14, color: colors.ink, lineHeight: 20, paddingLeft: 4, fontFamily: fonts.displayMedium },
});
