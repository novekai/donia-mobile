// Transactions (paginated history)
import { apiGet } from './client';
import type { Transaction, TxType } from './types';

export function listTransactions(opts: { type?: TxType; cursor?: string; limit?: number } = {}): Promise<{
  items: Transaction[]; nextCursor: string | null;
}> {
  const q = new URLSearchParams();
  if (opts.type) q.set('type', opts.type);
  if (opts.cursor) q.set('cursor', opts.cursor);
  if (opts.limit) q.set('limit', String(opts.limit));
  const qs = q.toString();
  return apiGet(`/v1/transactions${qs ? `?${qs}` : ''}`);
}
