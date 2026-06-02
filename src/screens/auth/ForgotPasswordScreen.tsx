// ForgotPassword — 3 méthodes (SMS / WhatsApp / Email) + grosse icône 🔑 qui bobbe
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { IconCheck } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const METHODS = [
  { id: 'sms', title: 'Par SMS', sub: '+229 90 12 34 56', emoji: '💬', accent: colors.coral },
  { id: 'wa', title: 'Par WhatsApp', sub: 'Même numéro', emoji: '📲', accent: '#25D366' },
  { id: 'em', title: 'Par email', sub: 'awa@donia.com', emoji: '✉️', accent: colors.indigo },
] as const;

type Mid = typeof METHODS[number]['id'];

export function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>) {
  const [selected, setSelected] = useState<Mid>('sms');
  const bobStyle = useBob();

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
        <Animated.View style={[bobStyle, styles.iconWrap]}>
          <BrandGradient variant="mango" style={styles.iconInner}>
            <Text style={styles.iconText}>🔑</Text>
          </BrandGradient>
        </Animated.View>
        <Text style={styles.title}>
          On va t'aider <Text style={styles.titleItalic}>à récupérer</Text> ton compte
        </Text>
        <Text style={styles.subtitle}>
          Choisis un canal — on t'enverra un code de réinitialisation.
        </Text>
      </View>

      <View style={styles.list}>
        {METHODS.map((m) => {
          const on = m.id === selected;
          return (
            <Pressable
              key={m.id}
              onPress={() => setSelected(m.id)}
              style={[styles.method, on && { borderWidth: 2, borderColor: m.accent }]}
            >
              <View style={[styles.methodIcon, { backgroundColor: `${m.accent}22` }]}>
                <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>{m.title}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <View style={[styles.radio, on && { backgroundColor: m.accent, borderWidth: 0 }]}>
                {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
        <Button label="Envoyer le code" pulse onPress={() => navigation.navigate('OTP')} />
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={styles.back}>
            Ça te revient ? <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 80, height: 80, borderRadius: 24, overflow: 'hidden', marginBottom: 18 },
  iconInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 36 },
  title: { fontFamily: fonts.displayMedium, fontSize: 30, color: colors.ink, letterSpacing: -0.6, lineHeight: 32 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  subtitle: { marginTop: 6, fontSize: 14, color: colors.ink2, lineHeight: 20 },
  list: { paddingHorizontal: 24, marginTop: 24, gap: 8 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineSoft },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  methodSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.ink2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
  back: { textAlign: 'center', fontSize: 13, color: colors.ink2 },
});
