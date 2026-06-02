// Donia — types de navigation centralisés
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParams = {
  Home: undefined;
  Send: undefined;
  Anonyme: undefined;
  History: undefined;
};

export type RootStackParams = {
  // Auth flow
  Splash: undefined;
  Onb1: undefined;
  Onb2: undefined;
  Onb3: undefined;
  Login: undefined;
  Signup: undefined;
  OTP: { phone?: string; email?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { contact: string; channel: 'WHATSAPP' | 'EMAIL' };

  // Main (bottom tabs)
  Main: NavigatorScreenParams<MainTabsParams>;

  // Profil (déplacé du bottom vers RootStack — accessible via HeaderAvatar)
  Profile: undefined;
  Settings: undefined;
  Wallet: undefined;

  // Anonymes flow
  AnonymesCreate: undefined;
  AnonymesLink: { code: string };
  AnonymesRead: { messageId: string };
  AnonymesReport: { messageId: string };

  // Modal / push above tabs
  Notifications: undefined;
  TopUpMethod: undefined;
  TopUpMobileMoney: undefined;
  TopUpCode: undefined;
  CardGallery: undefined;
  CardPreview: { themeKey?: string };
  SendCategory: undefined;
  SendRecipient: { categoryKey?: string };
  SendAmount: { categoryKey?: string; recipientPhone?: string; recipientName?: string };
  SendStyle: { categoryKey?: string; recipientPhone?: string; recipientName?: string; amount?: string };
  SendConfirm: { categoryKey?: string; recipientPhone?: string; recipientName?: string; amount?: string; palette?: string; message?: string };
  MultiContacts: undefined;
  Customize: { categoryKey?: string; recipientPhone?: string; recipientName?: string; amount?: string };
  Receive: { code?: string };
  RedeemSuccess: { amount?: string; sender?: string };
  TxDetail: { txId?: string };
  Cagnotte: undefined;
  Referral: undefined;
  MyInfo: undefined;
  Security: undefined;
  KYC: undefined;

  // Dev only
  Gallery: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParams> = NativeStackScreenProps<RootStackParams, T>;

export type MainTabScreenProps<T extends keyof MainTabsParams> = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParams, T>,
  NativeStackScreenProps<RootStackParams>
>;
