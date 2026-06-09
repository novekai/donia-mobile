// RootNavigator — stack racine : auth + main tabs + écrans modaux (push)
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParams } from './types';
import { MainTabs } from './MainTabs';
import { navigationRef } from '../lib/navigationRef';
import { useAuthStore } from '../store/auth';

const AUTH_ROUTES = new Set<string>([
  'Splash',
  'Onb1',
  'Onb2',
  'Onb3',
  'Login',
  'Signup',
  'OTP',
  'ForgotPassword',
  'ResetPassword',
]);

// Auth
import { SplashScreen } from '../screens/auth/SplashScreen';
import { Onb1Screen } from '../screens/auth/Onb1Screen';
import { Onb2Screen } from '../screens/auth/Onb2Screen';
import { Onb3Screen } from '../screens/auth/Onb3Screen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

// Main flow (above tabs)
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { BirthdaysScreen } from '../screens/main/BirthdaysScreen';
import { BirthdayProfileScreen } from '../screens/main/BirthdayProfileScreen';
import { TopUpMethodScreen } from '../screens/wallet/TopUpMethodScreen';
import { TopUpMobileMoneyScreen } from '../screens/wallet/TopUpMobileMoneyScreen';
import { TopUpCodeScreen } from '../screens/wallet/TopUpCodeScreen';
import { TopUpCardScreen } from '../screens/wallet/TopUpCardScreen';
import { WithdrawScreen } from '../screens/wallet/WithdrawScreen';

// Send flow
import { CardGalleryScreen } from '../screens/send/CardGalleryScreen';
import { CardPreviewScreen } from '../screens/send/CardPreviewScreen';
import { SendRecipientScreen } from '../screens/send/SendRecipientScreen';
import { SendAmountScreen } from '../screens/send/SendAmountScreen';
import { SendStyleScreen } from '../screens/send/SendStyleScreen';
import { SendConfirmScreen } from '../screens/send/SendConfirmScreen';
import { MultiContactsScreen } from '../screens/send/MultiContactsScreen';
import { CustomizeScreen } from '../screens/send/CustomizeScreen';

// Receive
import { ReceiveScreen } from '../screens/receive/ReceiveScreen';
import { RedeemSuccessScreen } from '../screens/receive/RedeemSuccessScreen';
import { TxDetailScreen } from '../screens/receive/TxDetailScreen';

// Community
import { CagnotteScreen } from '../screens/community/CagnotteScreen';
import { CagnotteCreateScreen } from '../screens/community/CagnotteCreateScreen';
import { ReferralScreen } from '../screens/community/ReferralScreen';

// Settings
import { MyInfoScreen } from '../screens/settings/MyInfoScreen';
import { SecurityScreen } from '../screens/settings/SecurityScreen';
import { KYCScreen } from '../screens/settings/KYCScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { SessionsScreen } from '../screens/settings/SessionsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { BirthdayScreen } from '../screens/settings/BirthdayScreen';
import { LanguageScreen } from '../screens/settings/LanguageScreen';
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen';
import { KYCUploadScreen } from '../screens/settings/KYCUploadScreen';
import { NotificationsPrefScreen } from '../screens/settings/NotificationsPrefScreen';
import { HelpScreen } from '../screens/settings/HelpScreen';

// Profile + Wallet (V2 : déplacés hors du bottom)
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { WalletScreen } from '../screens/main/WalletScreen';

// Anonymes flow
import { AnonymesCreateScreen } from '../screens/anonymes/AnonymesCreateScreen';
import { AnonymesLinkScreen } from '../screens/anonymes/AnonymesLinkScreen';
import { AnonymesLinkMessagesScreen } from '../screens/anonymes/AnonymesLinkMessagesScreen';
import { AnonymesReadScreen } from '../screens/anonymes/AnonymesReadScreen';
import { AnonymesReportScreen } from '../screens/anonymes/AnonymesReportScreen';

const Stack = createNativeStackNavigator<RootStackParams>();

export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  const prevTokenRef = useRef<string | null>(token);

  // When the token transitions to null while we're on an authenticated screen,
  // bounce the user back to Login (covers both explicit signOut() and the 401
  // interceptor wiping the token). We don't touch the stack if we're already
  // on an auth screen — that would create a navigation loop on cold start.
  useEffect(() => {
    const prev = prevTokenRef.current;
    prevTokenRef.current = token;
    if (prev && !token && navigationRef.isReady()) {
      const current = navigationRef.getCurrentRoute()?.name;
      if (!current || !AUTH_ROUTES.has(current)) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Onb1" component={Onb1Screen} />
        <Stack.Screen name="Onb2" component={Onb2Screen} />
        <Stack.Screen name="Onb3" component={Onb3Screen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Main */}
        <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />

        {/* Above tabs */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Birthdays" component={BirthdaysScreen} />
        <Stack.Screen name="BirthdayProfile" component={BirthdayProfileScreen} />
        <Stack.Screen name="TopUpMethod" component={TopUpMethodScreen} />
        <Stack.Screen name="TopUpMobileMoney" component={TopUpMobileMoneyScreen} />
        <Stack.Screen name="TopUpCode" component={TopUpCodeScreen} />
        <Stack.Screen name="TopUpCard" component={TopUpCardScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="CardGallery" component={CardGalleryScreen} />
        <Stack.Screen name="CardPreview" component={CardPreviewScreen} />
        <Stack.Screen name="SendRecipient" component={SendRecipientScreen} />
        <Stack.Screen name="SendAmount" component={SendAmountScreen} />
        <Stack.Screen name="SendStyle" component={SendStyleScreen} />
        <Stack.Screen name="SendConfirm" component={SendConfirmScreen} />
        <Stack.Screen name="MultiContacts" component={MultiContactsScreen} />
        <Stack.Screen name="Customize" component={CustomizeScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="RedeemSuccess" component={RedeemSuccessScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="TxDetail" component={TxDetailScreen} />
        <Stack.Screen name="Cagnotte" component={CagnotteScreen} />
        <Stack.Screen name="CagnotteCreate" component={CagnotteCreateScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen name="MyInfo" component={MyInfoScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="KYC" component={KYCScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Sessions" component={SessionsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Birthday" component={BirthdayScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="KYCUpload" component={KYCUploadScreen} />
        <Stack.Screen name="NotificationsPref" component={NotificationsPrefScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />

        {/* Anonymes flow (above bottom tabs) */}
        <Stack.Screen name="AnonymesCreate" component={AnonymesCreateScreen} />
        <Stack.Screen name="AnonymesLink" component={AnonymesLinkScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="AnonymesLinkMessages" component={AnonymesLinkMessagesScreen} />
        <Stack.Screen name="AnonymesRead" component={AnonymesReadScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="AnonymesReport" component={AnonymesReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
