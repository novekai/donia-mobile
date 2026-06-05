// KYC API helpers — upload doc images + submit.
import { api, apiGet, apiPost } from './client';

export type KycDocType = 'CNI' | 'PASSPORT' | 'PERMIS';
export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type KycSubmission = {
  id: string;
  docType: KycDocType;
  docUrlRecto: string;
  docUrlVerso: string | null;
  status: KycStatus;
  createdAt: string;
};

// Upload une image de pièce d'identité. `side` = 'recto' | 'verso'.
// Renvoie l'URL publique de l'image stockée sur R2.
export async function uploadKycImage(uri: string, side: 'recto' | 'verso'): Promise<{ url: string }> {
  const form = new FormData();
  const fileName = uri.split('/').pop() || `kyc-${side}-${Date.now()}.jpg`;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  form.append('photo', { uri, name: fileName, type: mimeType } as unknown as Blob);
  form.append('side', side);
  const { data } = await api.post<{ url: string }>('/v1/kyc/upload', form, {
    transformRequest: (d) => d,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export function submitKyc(payload: {
  docType: KycDocType;
  docUrlRecto: string;
  docUrlVerso?: string;
}): Promise<{ submission: KycSubmission }> {
  return apiPost('/v1/kyc', payload);
}

export function getLatestKyc(): Promise<{ latest: KycSubmission | null }> {
  return apiGet('/v1/kyc');
}
