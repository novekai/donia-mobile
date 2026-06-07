// Wallet endpoints
import { apiGet, apiPost } from './client';
import type { Transaction, Wallet } from './types';

export function getWallet(): Promise<{ wallet: Wallet }> {
  return apiGet<{ wallet: Wallet }>('/v1/wallet');
}

export function topupMobileMoney(body: {
  amount: number;
  operator: string;
  country: string;
  currency?: 'XOF' | 'EUR';
}) {
  return apiPost<{
    ok: true;
    txId: string;
    status: 'PENDING' | 'SUCCESS';
    paymentUrl?: string;
    fedapayTxId?: number;
  }>('/v1/wallet/topup/mobile-money', body);
}

export function topupCode(code: string): Promise<{ credited: string; gross: string; commission: string }> {
  return apiPost('/v1/wallet/topup/code', { code });
}

export type CodePreview = {
  code: string;
  amount: number;
  commission: number;
  commissionRate: number;
  net: number;
  occasion: string;
  themeKey: string;
  palette: string;
  senderName: string;
};

export function previewTopupCode(code: string): Promise<CodePreview> {
  return apiGet<CodePreview>(`/v1/wallet/topup/code/${encodeURIComponent(code)}/preview`);
}

export function getRecentTopups(): Promise<{ recent: Transaction[] }> {
  return apiGet('/v1/wallet/topup/recent');
}

// Retrait flexible : phoneNumber pour Mobile Money OU accountNumber pour carte bancaire / IBAN.
// `amount` est TOUJOURS en FCFA cote backend ; `currency` indique juste la devise affichee a l'user.
export function withdraw(body: {
  amount: number;            // FCFA
  operator: string;          // 'mtn', 'moov', 'orange', 'wave', 'bank_card'
  currency?: 'XOF' | 'EUR';  // devise saisie par l'user (parite fixe 655.957)
  phoneNumber?: string;      // E.164 si Mobile Money
  accountNumber?: string;    // IBAN ou numero de carte si bank_card
}) {
  return apiPost<{ ok: true; txId: string; status: 'PENDING'; message: string }>(
    '/v1/wallet/withdraw',
    body,
  );
}
