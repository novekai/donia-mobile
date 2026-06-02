// Notifications endpoints
import { apiGet, apiPost } from './client';
import type { Notification } from './types';

export function listNotifications(opts: { unreadOnly?: boolean; cursor?: string; limit?: number } = {}): Promise<{
  items: Notification[]; nextCursor: string | null; unread: number;
}> {
  const q = new URLSearchParams();
  if (opts.unreadOnly) q.set('unreadOnly', 'true');
  if (opts.cursor) q.set('cursor', opts.cursor);
  if (opts.limit) q.set('limit', String(opts.limit));
  const qs = q.toString();
  return apiGet(`/v1/notifications${qs ? `?${qs}` : ''}`);
}

export function markRead(ids?: string[]): Promise<{ ok: true }> {
  return apiPost('/v1/notifications/mark-read', { ids });
}
