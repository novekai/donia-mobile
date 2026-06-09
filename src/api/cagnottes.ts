// Cagnotte endpoints — création, consultation, contribution.
import { apiGet, apiPost } from './client';

export type CagnotteStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export type CagnotteSummary = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  goalAmount: string;       // Decimal serialized as string
  totalRaised: string;
  deadline: string | null;
  status: CagnotteStatus;
  publicCode: string | null;
  commissionPercent: string;
  withdrawnAt: string | null;
  withdrawnAmount: string | null;
  createdAt: string;
  _count?: { contributions: number };
};

export type CagnotteContributor = {
  id: string;
  contributorId: string;
  amount: string;
  message: string | null;
  createdAt: string;
  contributor: { id: string; name: string };
};

export type CagnotteDetail = CagnotteSummary & {
  contributions: CagnotteContributor[];
  owner: { id: string; name: string };
};

export function createCagnotte(body: {
  title: string;
  description?: string;
  goalAmount: number;
  deadline?: string;       // ISO datetime
}): Promise<{ cagnotte: CagnotteSummary }> {
  return apiPost('/v1/cagnottes', body);
}

export function listMyCagnottes(): Promise<{ items: CagnotteSummary[] }> {
  return apiGet('/v1/cagnottes/mine');
}

export function getCagnotte(id: string): Promise<{ cagnotte: CagnotteDetail }> {
  return apiGet(`/v1/cagnottes/${encodeURIComponent(id)}`);
}

export function contributeCagnotte(id: string, body: { amount: number; message?: string }) {
  return apiPost<{ contribution: CagnotteContributor }>(`/v1/cagnottes/${encodeURIComponent(id)}/contribute`, body);
}

export type CagnotteWithdrawResult = {
  cagnotte: CagnotteSummary;
  gross: string;
  commission: string;
  net: string;
  commissionPercent: string;
};

export function withdrawCagnotte(id: string) {
  return apiPost<CagnotteWithdrawResult>(`/v1/cagnottes/${encodeURIComponent(id)}/withdraw`, {});
}
