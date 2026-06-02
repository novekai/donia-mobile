// Me (profile) endpoints
import { api, apiGet, apiPatch, apiDelete } from './client';
import type { User } from './types';

export function getMe(): Promise<{ user: User }> {
  return apiGet<{ user: User }>('/v1/me');
}

export function updateMe(patch: Partial<Pick<User, 'name' | 'whatsapp' | 'email' | 'sex' | 'dob' | 'city' | 'country' | 'birthdayOptIn'>>): Promise<{ user: User }> {
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
