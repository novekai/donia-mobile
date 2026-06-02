// Referral stats
import { apiGet } from './client';

export function getReferral(): Promise<{
  code: string; filleulsCount: number; totalEarned: number; rate: number;
}> {
  return apiGet('/v1/referral');
}
