// Anonymes — appels API depuis l'app mobile (toutes les routes sont auth-required côté privé).
import { apiDelete, apiGet, apiPost } from './client';
import type { AnonymousLink, AnonymousMessage, AnonymousReportReason, AnonymousTheme } from './types';

// ── LINKS ──

export function listMyAnonymousLinks(): Promise<{ links: AnonymousLink[] }> {
  return apiGet('/v1/anonymes/links');
}

export function getActiveAnonymousLink(): Promise<{ link: AnonymousLink | null }> {
  return apiGet('/v1/anonymes/links/active');
}

export function createAnonymousLink(body: { prompt: string; theme: AnonymousTheme }): Promise<{ link: AnonymousLink }> {
  return apiPost('/v1/anonymes/links', body);
}

export function regenerateAnonymousLink(id: string): Promise<{ link: AnonymousLink }> {
  return apiPost(`/v1/anonymes/links/${id}/regenerate`);
}

export function suspendAnonymousLink(id: string): Promise<{ link: AnonymousLink }> {
  return apiPost(`/v1/anonymes/links/${id}/suspend`);
}

// ── MESSAGES ──

export function listAnonymousMessages(opts: { cursor?: string; limit?: number } = {}): Promise<{
  items: AnonymousMessage[];
  nextCursor: string | null;
}> {
  const q = new URLSearchParams();
  if (opts.cursor) q.set('cursor', opts.cursor);
  if (opts.limit) q.set('limit', String(opts.limit));
  const qs = q.toString();
  return apiGet(`/v1/anonymes/messages${qs ? `?${qs}` : ''}`);
}

export function toggleFavoriteAnonymousMessage(id: string): Promise<{ message: { id: string; isFavorite: boolean } }> {
  return apiPost(`/v1/anonymes/messages/${id}/favorite`);
}

export function markAnonymousMessageRead(id: string): Promise<{ ok: true }> {
  return apiPost(`/v1/anonymes/messages/${id}/read`);
}

export function deleteAnonymousMessage(id: string): Promise<{ ok: true }> {
  return apiDelete(`/v1/anonymes/messages/${id}`);
}

export function reportAnonymousMessage(id: string, reason: AnonymousReportReason): Promise<{ ok: true }> {
  return apiPost(`/v1/anonymes/messages/${id}/report`, { reason });
}

export function countUnreadAnonymousMessages(): Promise<{ count: number }> {
  return apiGet('/v1/anonymes/messages/count-unread');
}
