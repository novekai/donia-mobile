// Push tokens — demande la permission, récupère l'Expo Push Token, l'envoie au backend.
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { api } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let registered = false;

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null; // emulator → no push
  if (registered) return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F4486F',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (token) {
      await api.post('/v1/push/register', {
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        deviceName: Device.modelName ?? undefined,
      });
      registered = true;
    }
    return token;
  } catch (e) {
    // Best-effort — never block login over push registration
    console.warn('push register failed', e);
    return null;
  }
}
