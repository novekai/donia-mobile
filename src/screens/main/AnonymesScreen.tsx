// Anonymes — onglet principal (refonte juin 2026).
// Affiche la liste de TOUS les liens créés par l'utilisateur.
// Click sur un lien → AnonymesLinkMessagesScreen qui montre les messages de CE lien.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { HeaderAvatar } from '../../components/composed/HeaderAvatar';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { IconPlus, IconAnonyme } from '../../components/ui/Icons';
import { useTwinkle } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { MainTabScreenProps } from '../../navigation/types';
import { listMyAnonymousLinks, countUnreadAnonymousMessages } from '../../api/anonymes';
import type { AnonymousLink } from '../../api/types';

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

const LINK_VARIANTS = ['indigo', 'coral', 'mango', 'pink', 'mint', 'plum'] as const;
type LinkVariant = (typeof LINK_VARIANTS)[number];

function variantFor(id: string): LinkVariant {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return LINK_VARIANTS[Math.abs(h) % LINK_VARIANTS.length];
}

export function AnonymesScreen({ navigation }: MainTabScreenProps<'Anonyme'>) {
  const twinkleStyle = useTwinkle();
  const queryClient = useQueryClient();

  const linksQuery = useQuery({ queryKey: ['anon-links'], queryFn: listMyAnonymousLinks });
  useQuery({
    queryKey: ['anon-unread'],
    queryFn: countUnreadAnonymousMessages,
    refetchInterval: 60_000,
  });

  const links = linksQuery.data?.links ?? [];
  const activeLinks = links.filter((l) => l.status === 'ACTIVE');
  const archivedLinks = links.filter((l) => l.status !== 'ACTIVE');

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['anon-links'] });
    queryClient.invalidateQueries({ queryKey: ['anon-unread'] });
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={linksQuery.isRefetching} onRefresh={refresh} tintColor={colors.coral} />}
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
              <Text style={styles.createCtaText}>Créer un nouveau lien</Text>
            </BrandGradient>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          {linksQuery.isLoading && (
            <Text style={styles.loading}>Chargement de tes liens…</Text>
          )}

          {!linksQuery.isLoading && links.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💌</Text>
              <Text style={styles.emptyTitle}>Aucun lien anonyme</Text>
              <Text style={styles.emptySub}>
                Crée ton premier lien anonyme. Tu pourras le partager sur tes stories et recevoir des messages de tes proches.
              </Text>
            </View>
          )}

          {activeLinks.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Mes liens actifs</Text>
              <View style={{ gap: 12 }}>
                {activeLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    twinkleStyle={twinkleStyle}
                    onPress={() =>
                      navigation.navigate('AnonymesLinkMessages', {
                        linkId: link.id,
                        code: link.code,
                        prompt: link.prompt,
                      })
                    }
                  />
                ))}
              </View>
            </>
          )}

          {archivedLinks.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Anciens liens</Text>
              <View style={{ gap: 12 }}>
                {archivedLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    dimmed
                    onPress={() =>
                      navigation.navigate('AnonymesLinkMessages', {
                        linkId: link.id,
                        code: link.code,
                        prompt: link.prompt,
                      })
                    }
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function LinkCard({
  link,
  onPress,
  dimmed,
  twinkleStyle,
}: {
  link: AnonymousLink;
  onPress: () => void;
  dimmed?: boolean;
  twinkleStyle?: ReturnType<typeof useTwinkle>;
}) {
  const variant = variantFor(link.id) as LinkVariant;
  const count = link._count?.messages ?? 0;
  const url = `${SHARE_URL_BASE}/${link.code}`;

  return (
    <Pressable onPress={onPress} style={[shadow.indigo, dimmed && { opacity: 0.65 }]}>
      <BrandGradient variant={variant === 'plum' ? 'indigo' : (variant as 'indigo' | 'coral' | 'mango' | 'pink' | 'mint')} style={styles.linkCard}>
        {twinkleStyle && (
          <Animated.View style={[twinkleStyle, { position: 'absolute', top: 12, right: 14 }]}>
            <Sparkle size={14} color={colors.mango} />
          </Animated.View>
        )}
        <Text style={styles.linkPrompt} numberOfLines={2}>« {link.prompt} »</Text>
        <Text style={styles.linkUrl} numberOfLines={1}>{url}</Text>
        <View style={styles.linkFooter}>
          <View style={styles.linkBadge}>
            <IconAnonyme size={12} color={colors.indigoDeep} />
            <Text style={styles.linkBadgeText}>
              {count} message{count > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.linkDate}>{relativeTime(link.createdAt)}</Text>
        </View>
      </BrandGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  headerTitle: { fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5 },

  createCta: { borderRadius: 16, overflow: 'hidden' },
  createCtaInner: { paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createCtaText: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },

  loading: { textAlign: 'center', color: colors.ink2, paddingVertical: 20, fontFamily: fonts.displayItalic },

  sectionLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 10 },

  linkCard: { borderRadius: 18, padding: 16, position: 'relative', overflow: 'hidden' },
  linkPrompt: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.bg, letterSpacing: -0.2, lineHeight: 23 },
  linkUrl: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.bg, opacity: 0.85 },
  linkFooter: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: colors.mango },
  linkBadgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigoDeep },
  linkDate: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.bg, opacity: 0.7 },

  emptyCard: { padding: 28, alignItems: 'center', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18 },
});
