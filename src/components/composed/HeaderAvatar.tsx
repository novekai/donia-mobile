// HeaderAvatar — bouton avatar en haut à droite qui mène au Profil.
// Affiche la photo de profil si présente, sinon l'initiale du prénom sur fond coloré aléatoire.
// Petit dot de notification si l'user a des notifs non lues.
import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMe } from '../../api/me';
import { useAuthStore } from '../../store/auth';
import { usePulse } from '../../theme/animations';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import type { RootStackParams } from '../../navigation/types';

const PALETTE = [colors.coral, colors.indigo, colors.mango, colors.mint, colors.pink, colors.plum];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

type Props = {
  size?: number;
  hasNotifications?: boolean;
};

export function HeaderAvatar({ size = 42, hasNotifications = true }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const storedUser = useAuthStore((s) => s.user);
  const pulseStyle = usePulse();

  const user = meQuery.data?.user ?? storedUser;
  const name = user?.name ?? '';
  const firstName = name.split(' ')[0] ?? '';
  const initial = (firstName[0] ?? 'D').toUpperCase();
  const avatarUrl = (user && 'avatarUrl' in user ? user.avatarUrl : null) as string | null | undefined;
  const bgColor = pickColor(user?.id ?? firstName ?? 'D');

  return (
    <Pressable
      onPress={() => navigation.navigate('Profile')}
      hitSlop={8}
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, shadow.e1]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
      )}
      {hasNotifications && <Animated.View style={[pulseStyle, styles.dot]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  initial: {
    fontFamily: fonts.displaySemiBold,
    color: colors.bg,
    letterSpacing: -0.5,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.coral,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
