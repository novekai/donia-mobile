// Notifications — tabs + groupes par jour + pastille rouge unread + pulse
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const TABS = [
  { l: 'Toutes', count: 7 },
  { l: 'Non lues', count: 2 },
  { l: 'Mentions', count: 0 },
];

const GROUPS = [
  { day: "Aujourd'hui", items: [
    { who: 'Marie Dossou', text: "t'a envoyé un cadeau de 5 000 FCFA", time: 'il y a 12 min', emoji: '🎁', color: colors.pink, unread: true },
    { who: 'Kofi Mensah', text: 'a réagi à ton cadeau avec ❤️', time: '14:32', emoji: '💬', color: colors.coral, unread: true },
    { who: 'Donia', text: 'Ton solde a été rechargé de 25 000 FCFA via Wave', time: '09:21', emoji: '💰', color: colors.mint, unread: false },
  ]},
  { day: 'Hier', items: [
    { who: 'Donia', text: 'Sam a rejoint Donia grâce à toi · +500 FCFA gagnés', time: '18:14', emoji: '✨', color: colors.mango, unread: false },
    { who: 'Aïcha Traoré', text: 'a converti ta carte GoShop de 15 200 FCFA', time: '11:02', emoji: '🛍️', color: colors.mango, unread: false },
    { who: 'Donia', text: "Ta vérification d'identité (KYC) a été validée !", time: '08:45', emoji: '✅', color: colors.mint, unread: false },
  ]},
  { day: 'Cette semaine', items: [
    { who: 'Donia', text: 'Nouvelle carte disponible : Tabaski 2026 🌙', time: '24 mai', emoji: '🌙', color: colors.indigo, unread: false },
  ]},
];

export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const [tab, setTab] = useState(0);
  const pulseStyle = usePulse();

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable>
            <Text style={styles.markRead}>Tout marquer lu</Text>
          </Pressable>
        }
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t, i) => {
          const on = tab === i;
          return (
            <Pressable key={t.l} onPress={() => setTab(i)} style={[styles.tab, on && { backgroundColor: colors.coral }]}>
              <Text style={[styles.tabLabel, on && { color: colors.bg }]}>{t.l}</Text>
              {t.count > 0 && (
                <View style={[styles.tabCount, { backgroundColor: on ? 'rgba(253,247,246,0.25)' : 'rgba(244,72,111,0.15)' }]}>
                  <Text style={[styles.tabCountText, { color: on ? colors.bg : colors.coral }]}>{t.count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 22 }}>
        {GROUPS.map((g, gi) => (
          <View key={gi} style={{ marginBottom: 18 }}>
            <Text style={styles.dayLabel}>{g.day}</Text>
            <Card pad={0}>
              {g.items.map((n, i) => (
                <View key={i} style={[styles.row, i < g.items.length - 1 && styles.rowDivider]}>
                  {n.unread && <Animated.View style={[pulseStyle, styles.unreadDot]} />}
                  <View style={[styles.icon, { backgroundColor: `${n.color}22` }]}>
                    <Text style={{ fontSize: 18 }}>{n.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.text}>
                      <Text style={styles.who}>{n.who}</Text> {n.text}
                    </Text>
                    <Text style={styles.time}>{n.time}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markRead: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.coral },
  tabs: { paddingHorizontal: 22, paddingTop: 14, flexDirection: 'row', gap: 6 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  tabLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
  tabCount: { paddingHorizontal: 6, borderRadius: 99, minWidth: 16, alignItems: 'center' },
  tabCountText: { fontSize: 10, fontFamily: fonts.bodyBold },
  dayLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8, paddingLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  unreadDot: { position: 'absolute', top: 18, left: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 13, lineHeight: 18, color: colors.ink },
  who: { fontFamily: fonts.displaySemiBold },
  time: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink3, marginTop: 3 },
});
