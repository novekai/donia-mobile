// Anonymes — onglet principal (V2 design). Mon lien actif + messages reçus.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Share, Alert, RefreshControl, Clipboard } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { HeaderAvatar } from '../../components/composed/HeaderAvatar';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Button } from '../../components/ui/Button';
import { IconPlus, IconAnonyme } from '../../components/ui/Icons';
import { useBob, useTwinkle } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { MainTabScreenProps } from '../../navigation/types';
import {
  getActiveAnonymousLink,
  listAnonymousMessages,
  countUnreadAnonymousMessages,
} from '../../api/anonymes';
import type { AnonymousMessage } from '../../api/types';

const SHARE_URL_BASE = 'https://doniia.com/a';

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'à l\'instant';
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

export function AnonymesScreen({ navigation }: MainTabScreenProps<'Anonyme'>) {
  const twinkleStyle = useTwinkle();
  const queryClient = useQueryClient();

  const linkQuery = useQuery({ queryKey: ['anon-active'], queryFn: getActiveAnonymousLink });
  const msgsQuery = useQuery({ queryKey: ['anon-messages'], queryFn: () => listAnonymousMessages({ limit: 30 }) });
  useQuery({
    queryKey: ['anon-unread'],
    queryFn: countUnreadAnonymousMessages,
    refetchInterval: 60_000,
  });

  const link = linkQuery.data?.link;
  const messages: AnonymousMessage[] = msgsQuery.data?.items ?? [];

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['anon-active'] });
    queryClient.invalidateQueries({ queryKey: ['anon-messages'] });
    queryClient.invalidateQueries({ queryKey: ['anon-unread'] });
  }

  async function onCopy() {
    if (!link) return;
    const url = `${SHARE_URL_BASE}/${link.code}`;
    Clipboard.setString(url);
    Alert.alert('Copié ✨', url);
  }

  async function onShare() {
    if (!link) return;
    const url = `${SHARE_URL_BASE}/${link.code}`;
    try {
      await Share.share({
        message: `${link.prompt}\n\nÉcris-moi en anonyme : ${url}`,
        url,
      });
    } catch {}
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={msgsQuery.isRefetching} onRefresh={refresh} tintColor={colors.coral} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Ta boîte secrète</Text>
            <Text style={styles.headerTitle}>Anonymes ✨</Text>
          </View>
          <HeaderAvatar />
        </View>

        {/* Create CTA */}
        <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
          <Pressable
            onPress={() => navigation.navigate('AnonymesCreate')}
            style={[styles.createCta, shadow.indigo]}
          >
            <BrandGradient variant="indigo" style={styles.createCtaInner}>
              <IconPlus size={16} color={colors.bg} strokeWidth={2.5} />
              <Text style={styles.createCtaText}>
                {link ? 'Régénérer mon lien anonyme' : 'Créer un nouveau lien anonyme'}
              </Text>
            </BrandGradient>
          </Pressable>
        </View>

        {/* Active link card */}
        {link && (
          <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
            <BrandGradient variant="indigo" style={[styles.activeCard, shadow.indigo]}>
              <Animated.View style={[twinkleStyle, { position: 'absolute', top: 12, right: 14 }]}>
                <Sparkle size={14} color={colors.mango} />
              </Animated.View>
              <Text style={styles.activeLabel}>MON LIEN ACTIF</Text>
              <Text style={styles.activeUrl} numberOfLines={1}>
                doniia.com/a/<Text style={{ color: colors.mango }}>{link.code}</Text>
              </Text>
              <Text style={styles.activePrompt} numberOfLines={1}>
                « {link.prompt} » · {link._count?.messages ?? 0} message{(link._count?.messages ?? 0) > 1 ? 's' : ''} reçu{(link._count?.messages ?? 0) > 1 ? 's' : ''}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable onPress={onCopy} style={[styles.actBtn, { backgroundColor: 'rgba(253,247,246,0.14)' }]}>
                  <Text style={styles.actBtnText}>📋 Copier</Text>
                </Pressable>
                <Pressable onPress={onShare} style={[styles.actBtn, { backgroundColor: colors.mango }]}>
                  <Text style={[styles.actBtnText, { color: colors.indigoDeep }]}>🔗 Partager</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('AnonymesLink', { code: link.code })}
                  style={[styles.actBtn, { backgroundColor: 'rgba(253,247,246,0.14)' }]}
                >
                  <Text style={styles.actBtnText}>🖼️ QR</Text>
                </Pressable>
              </View>
            </BrandGradient>
          </View>
        )}

        {/* Messages list */}
        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          <View style={styles.msgsHead}>
            <Text style={styles.msgsTitle}>Messages reçus</Text>
            <Text style={styles.msgsCount}>
              {messages.length === 0 ? 'aucun pour l\'instant' : `${messages.length} au total`}
            </Text>
          </View>

          {messages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💌</Text>
              <Text style={styles.emptyTitle}>Aucun message anonyme</Text>
              <Text style={styles.emptySub}>
                {link
                  ? 'Partage ton lien sur tes stories — quand quelqu\'un t\'écrit, ça apparaît ici.'
                  : 'Crée ton lien anonyme pour recevoir des messages de tes proches.'}
              </Text>
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
                        <Text style={[styles.msgTagAnon, { color: c }]}>ANONYME</Text>
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  headerTitle: { fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5 },

  createCta: { borderRadius: 16, overflow: 'hidden' },
  createCtaInner: { paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createCtaText: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },

  activeCard: { borderRadius: 18, padding: 16, position: 'relative', overflow: 'hidden' },
  activeLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mango, letterSpacing: 1.2 },
  activeUrl: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.bg },
  activePrompt: { marginTop: 4, fontFamily: fonts.displayItalic, fontSize: 12, color: colors.bg, opacity: 0.8 },
  actionsRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  actBtn: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  actBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.bg },

  msgsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
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
