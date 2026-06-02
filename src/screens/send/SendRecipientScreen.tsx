// SendRecipient — input téléphone + pastille opérateur + récents + envoi multi
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { StepHeader } from '../../components/composed/StepHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconPlus, IconChevR } from '../../components/ui/Icons';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

// Detection basique d'opérateur d'après l'indicatif/prefix.
// À enrichir : table complète des préfixes des 10 pays.
const PREFIX_DETECTION: { country: string; flag: string; prefix: string; operators: { name: string; localPrefixes: string[] }[] }[] = [
  {
    country: 'Bénin', flag: '🇧🇯', prefix: '+229',
    operators: [
      { name: 'MTN Bénin', localPrefixes: ['90', '91', '96', '97'] },
      { name: 'Moov Bénin', localPrefixes: ['94', '95', '98', '99'] },
      { name: 'Celtiis', localPrefixes: ['51', '52'] },
    ],
  },
];

function detectOperator(phoneE164: string): string | null {
  for (const c of PREFIX_DETECTION) {
    if (phoneE164.startsWith(c.prefix)) {
      const local = phoneE164.slice(c.prefix.length).replace(/\D/g, '');
      const first2 = local.slice(0, 2);
      const op = c.operators.find((o) => o.localPrefixes.includes(first2));
      if (op) return op.name;
      return `${c.country} (opérateur inconnu)`;
    }
  }
  return null;
}

export function SendRecipientScreen({ navigation, route }: RootStackScreenProps<'SendRecipient'>) {
  const categoryKey = route.params?.categoryKey;
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const pulseStyle = usePulse();

  // Detect operator from typed phone
  const phoneE164 = phone ? '+229' + phone.replace(/\D/g, '') : '';
  const operator = phoneE164.length > 6 ? detectOperator(phoneE164) : null;

  const isValid = phone.replace(/\D/g, '').length >= 8;

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <StepHeader step={2} of={4} title="À qui envoyer ?" sub="Destinataire" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Numéro du destinataire</Text>
        <View style={styles.phoneRow}>
          <View style={styles.flag}>
            <Text style={{ fontSize: 18 }}>🇧🇯</Text>
            <Text style={styles.flagCode}>+229</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.phoneInput}
          />
        </View>
        {operator && (
          <View style={styles.opPill}>
            <Animated.View style={[pulseStyle, styles.opPillDot]} />
            <Text style={styles.opPillText}>Détecté : {operator}</Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 18 }]}>Prénom du destinataire (optionnel)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Kofi"
          placeholderTextColor={colors.ink3}
          style={styles.nameInput}
        />

        {/* Multi-envoi card */}
        <Pressable onPress={() => navigation.navigate('MultiContacts')} style={{ marginTop: 24 }}>
          <Card pad={14} style={styles.multi}>
            <View style={styles.multiIcon}>
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.multiTitle}>Envoi multiple</Text>
              <Text style={styles.multiSub}>Plusieurs destinataires d'un coup</Text>
            </View>
            <IconChevR color={colors.ink2} />
          </Card>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={name ? `Continuer avec ${name}` : 'Continuer'}
          pulse
          disabled={!isValid}
          onPress={() => navigation.navigate('SendAmount', { categoryKey, recipientPhone: phoneE164, recipientName: name || undefined })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 6 },
  phoneRow: { flexDirection: 'row', height: 54, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.coral, overflow: 'hidden' },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: colors.lineSoft, backgroundColor: 'rgba(249,160,28,0.12)' },
  flagCode: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  phoneInput: { flex: 1, paddingHorizontal: 14, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  opPill: { marginTop: 8, flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: 'rgba(249,160,28,0.16)' },
  opPillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mango },
  opPillText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.mangoDeep },
  section: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink, marginBottom: 12 },
  nameInput: { height: 54, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, paddingHorizontal: 14, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, marginTop: 4 },
  recents: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  recent: { flex: 1, alignItems: 'center', gap: 6 },
  recentAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  recentSelected: { borderWidth: 3, borderColor: colors.coral },
  recentInitial: { fontFamily: fonts.displaySemiBold, fontSize: 22 },
  recentName: { fontSize: 11, color: colors.ink, fontFamily: fonts.bodyMedium },
  multi: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  multiIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(93,191,160,0.18)', alignItems: 'center', justifyContent: 'center' },
  multiTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  multiSub: { fontSize: 12, color: colors.ink2 },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
