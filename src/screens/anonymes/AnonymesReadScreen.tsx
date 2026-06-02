// Anonymes — lecture d'un message en plein écran (Direction C v2 mockup, fond dégradé).
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Share } from 'react-native';
import Animated from 'react-native-reanimated';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { IconArrowL, IconAnonyme } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import {
  listAnonymousMessages,
  markAnonymousMessageRead,
  toggleFavoriteAnonymousMessage,
  deleteAnonymousMessage,
} from '../../api/anonymes';
import { getApiErrorMessage } from '../../api/client';

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'hier';
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export function AnonymesReadScreen({ navigation, route }: RootStackScreenProps<'AnonymesRead'>) {
  const messageId = route.params?.messageId ?? '';
  const queryClient = useQueryClient();
  const bobStyle = useBob({ duration: 5500 });

  // We grab from the cached list; if not cached, fetch and find
  const msgsQuery = useQuery({ queryKey: ['anon-messages'], queryFn: () => listAnonymousMessages({ limit: 50 }) });
  const message = msgsQuery.data?.items.find((m) => m.id === messageId);

  useEffect(() => {
    if (message && !message.readAt) {
      markAnonymousMessageRead(message.id).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['anon-unread'] });
    }
  }, [message, queryClient]);

  const favMutation = useMutation({
    mutationFn: () => toggleFavoriteAnonymousMessage(messageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anon-messages'] }),
    onError: (e) => Alert.alert('Erreur', getApiErrorMessage(e)),
  });

  const delMutation = useMutation({
    mutationFn: () => deleteAnonymousMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anon-messages'] });
      navigation.goBack();
    },
    onError: (e) => Alert.alert('Erreur', getApiErrorMessage(e)),
  });

  function onDelete() {
    Alert.alert('Supprimer ?', 'Ce message disparaîtra de ta boîte.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => delMutation.mutate() },
    ]);
  }

  async function onShareMessage() {
    if (!message) return;
    try {
      await Share.share({
        message: `« ${message.content} »\n\nJ'ai reçu ce message anonyme sur Donia ✨ — toi aussi, crée ton lien : https://doniia.com`,
      });
    } catch {}
  }

  if (!message) {
    return (
      <ScreenContainer>
        <View style={[styles.center, { padding: 40 }]}>
          <Text style={styles.errorText}>Message introuvable</Text>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>← Retour</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[colors.coral, colors.plum, colors.indigo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.bgDeco}>
        <ConcentricRings size={400} color={colors.bg} opacity={0.14} anim="spin" />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IconArrowL size={16} color={colors.bg} />
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconAnonyme size={16} color={colors.mango} />
            <Text style={styles.headerText}>Message anonyme · {relativeTime(message.createdAt)}</Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageWrap}>
          <Animated.View style={[bobStyle, { marginBottom: 18 }]}>
            <Text style={styles.envelope}>💌</Text>
          </Animated.View>
          <Text style={styles.messageText}>« {message.content} »</Text>
        </View>

        {/* Actions row */}
        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => favMutation.mutate()}
              style={[styles.actBtn, message.isFavorite && styles.actBtnFav]}
            >
              <Text style={[styles.actEmoji, message.isFavorite && { color: colors.coral }]}>{message.isFavorite ? '❤' : '🤍'}</Text>
              <Text style={[styles.actText, message.isFavorite && { color: colors.coral }]}>Favori</Text>
            </Pressable>
            <Pressable onPress={onShareMessage} style={styles.actBtn}>
              <Text style={styles.actEmoji}>🔗</Text>
              <Text style={styles.actText}>Partager</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={styles.actBtn} disabled={delMutation.isPending}>
              <Text style={styles.actEmoji}>🗑️</Text>
              <Text style={styles.actText}>Supprimer</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AnonymesReport', { messageId })}
              style={styles.actBtn}
            >
              <Text style={styles.actEmoji}>🚩</Text>
              <Text style={styles.actText}>Signaler</Text>
            </Pressable>
          </View>

          <Pressable onPress={onShareMessage} style={styles.replyCta}>
            <Text style={styles.replyCtaText}>Répondre dans ma story 📲</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bgDeco: { position: 'absolute', top: 40, left: '50%', marginLeft: -200 },
  container: { flex: 1, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.bg, fontSize: 16 },
  headerRow: { paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(253,247,246,0.18)', borderWidth: 1, borderColor: 'rgba(253,247,246,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerText: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.bg },
  messageWrap: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  envelope: { fontSize: 56 },
  messageText: { fontFamily: fonts.displayMedium, fontSize: 28, color: colors.bg, textAlign: 'center', lineHeight: 38, letterSpacing: -0.3 },
  actionsWrap: { paddingHorizontal: 22, paddingBottom: 28 },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(253,247,246,0.14)', borderWidth: 1, borderColor: 'rgba(253,247,246,0.2)', alignItems: 'center', gap: 4 },
  actBtnFav: { backgroundColor: colors.bg, borderColor: colors.bg },
  actEmoji: { fontSize: 18 },
  actText: { fontFamily: fonts.displaySemiBold, fontSize: 11, color: colors.bg },
  replyCta: { backgroundColor: colors.mango, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  replyCtaText: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.indigoDeep },
});
