// Me (profile) endpoints
import { api, apiGet, apiPatch, apiPost, apiDelete } from './client';
import type { User } from './types';

export function getMe(): Promise<{ user: User }> {
  return apiGet<{ user: User }>('/v1/me');
}

// Champs éditables via PATCH /v1/me. Doit rester en phase avec patchSchema (backend/src/routes/me.ts).
type EditableProfileFields =
  | 'name' | 'whatsapp' | 'email' | 'sex' | 'dob' | 'city' | 'country'
  | 'birthdayOptIn'
  | 'showEmailPublic' | 'showPhonePublic' | 'showAvatarPublic'
  | 'preferredLanguage';

export function updateMe(patch: Partial<Pick<User, EditableProfileFields>>): Promise<{ user: User }> {
  return apiPatch<{ user: User }>('/v1/me', patch);
}

// Upload a profile photo. `uri` is a local file URI (file:// on iOS, content:// on Android).
// IMPORTANT: do NOT set Content-Type manually — RN auto-generates the multipart boundary
// when we let axios infer the header from FormData. Forcing the header drops the boundary
// and multer can't parse the upload.
export async function uploadAvatar(uri: string): Promise<{ user: User }> {
  const form = new FormData();
  const fileName = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  form.append('photo', { uri, name: fileName, type: mimeType } as unknown as Blob);
  const { data } = await api.post<{ user: User }>('/v1/me/avatar', form, {
    transformRequest: (d) => d,
    timeout: 60000,
  });
  return data;
}

export function deleteAvatar(): Promise<{ user: User }> {
  return apiDelete<{ user: User }>('/v1/me/avatar');
}

// RGPD : suppression définitive du compte. L'utilisateur doit retaper "SUPPRIMER"
// pour confirmer (anti-erreur). Le backend anonymise toutes les PII, révoque les
// sessions, supprime les tokens push et désactive les liens anonymes. Les transactions
// financières sont conservées (obligation BCEAO 10 ans).
export async function deleteAccount(): Promise<{ ok: true }> {
  // apiDelete ne supporte pas de body, on passe par api.delete directement.
  const { data } = await api.delete<{ ok: true }>('/v1/me', {
    data: { confirmation: 'SUPPRIMER' },
  });
  return data;
}

// Sessions actives — utilisées par les écrans Sécurité > Sessions / Appareils
export type ActiveSession = {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export function listSessions(): Promise<{ sessions: ActiveSession[] }> {
  return apiGet<{ sessions: ActiveSession[] }>('/v1/me/sessions');
}

export function revokeSession(id: string): Promise<{ ok: true }> {
  return apiPost<{ ok: true }>(`/v1/me/sessions/${id}/revoke`);
}

export function revokeAllOtherSessions(): Promise<{ ok: true; revoked: number }> {
  return apiPost<{ ok: true; revoked: number }>('/v1/me/sessions/revoke-all');
}
