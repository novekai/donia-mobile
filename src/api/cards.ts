// Cards endpoints (send, get, redeem, react, resend)
import { apiGet, apiPost } from './client';
import type { Card, CardPalette, DeliveryChannel } from './types';

export type CreateCardBody = {
  recipientPhone: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientCountry?: string;
  occasion?: string;
  themeKey?: string;
  amount: number;
  message?: string;
  palette?: CardPalette;
  deliveryChannel?: DeliveryChannel;
};

export function createCard(body: CreateCardBody): Promise<{ card: Card }> {
  return apiPost('/v1/cards', body);
}

export function createCardWithMobileMoney(body: CreateCardBody & { payerPhone: string }): Promise<{
  card: Card;
  paymentUrl: string;
  fedapayTxId: string;
}> {
  return apiPost('/v1/cards/pay-mobile-money', body);
}

export function getCard(id: string): Promise<{ card: Card }> {
  return apiGet(`/v1/cards/${id}`);
}

export function redeemCard(code: string, destination: 'MOBILE_MONEY' | 'DONIA_BALANCE'): Promise<{
  gross: string; commission: string; net: string; destination: string;
}> {
  return apiPost(`/v1/cards/${code}/redeem`, { destination });
}

export function reactToCard(id: string, emoji: '❤️' | '🎉' | '🙏' | '😍' | '✨'): Promise<{ ok: true }> {
  return apiPost(`/v1/cards/${id}/react`, { emoji });
}

export function resendCard(id: string): Promise<{ ok: true }> {
  return apiPost(`/v1/cards/${id}/resend`);
}
