// Translates a push notification tap into a navigation action.
// Each push we send from the backend carries a `data.type` field that maps
// to a screen in the app. Unknown types fall back to the home tab.
import * as Notifications from 'expo-notifications';
import { safeNavigate } from './navigationRef';

type PushData = {
  type?: string;
  cardId?: string;
  messageId?: string;
  filleulId?: string;
};

export function handlePushPayload(data: PushData | null | undefined): void {
  if (!data || typeof data !== 'object') {
    safeNavigate('Main', { screen: 'Home' });
    return;
  }

  switch (data.type) {
    case 'received_card':
      // Reception in-app — open the TxDetail when we have a cardId,
      // fall back to the History tab otherwise so the user lands somewhere useful.
      if (data.cardId) {
        safeNavigate('TxDetail', { txId: data.cardId });
      } else {
        safeNavigate('Main', { screen: 'History' });
      }
      return;

    case 'card_redeemed':
      // The sender is notified — open the corresponding tx
      if (data.cardId) {
        safeNavigate('TxDetail', { txId: data.cardId });
      } else {
        safeNavigate('Main', { screen: 'History' });
      }
      return;

    case 'referral_bonus':
    case 'new_filleul':
      safeNavigate('Referral');
      return;

    case 'kyc_approved':
    case 'kyc_rejected':
      safeNavigate('KYC');
      return;

    case 'anonymous_message':
      // Open the Anonymes tab so the user sees the new message in their inbox.
      // If we have the messageId we go to the reader directly.
      if (data.messageId) {
        safeNavigate('AnonymesRead', { messageId: data.messageId });
      } else {
        safeNavigate('Main', { screen: 'Anonyme' });
      }
      return;

    default:
      safeNavigate('Main', { screen: 'Home' });
  }
}

/**
 * Wires up the two cases where a push can deep-link us:
 *  1. User taps a notification while the app is foregrounded or backgrounded
 *  2. User taps a notification while the app is killed → it boots into that screen
 * Returns a teardown function for `useEffect`.
 */
export function attachPushResponseListeners(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handlePushPayload(response.notification.request.content.data as PushData);
  });

  // Cold-start: was the app opened by tapping a notif?
  Notifications.getLastNotificationResponseAsync().then((resp) => {
    if (resp) {
      handlePushPayload(resp.notification.request.content.data as PushData);
    }
  });

  return () => subscription.remove();
}
