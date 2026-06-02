// Wallet endpoints
import { apiGet, apiPost } from './client';
import type { Transaction, Wallet } from './types';

export function getWallet(): Promise<{ wallet: Wallet }> {
  return apiGet<{ wallet: Wallet }>('/v1/wallet');
}

export function topupMobileMoney(body: { amount: number; operator: string; country: string }) {
  return apiPost<{ ok: true; txId: string; status: 'PENDING' | 'SUCCESS' }>(
    '/v1/wallet/topup/mobile-money',
    body,
  );
}

export function topupCode(code: string): Promise<{ credited: string; gross: string; commission: string }> {
  return apiPost('/v1/wallet/topup/code', { code });
}

export function getRecentTopups(): Promise<{ recent: Transaction[] }> {
  return apiGet('/v1/wallet/topup/recent');
}
