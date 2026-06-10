// Lit les paramètres de plateforme publics (montants min/max, taux commission affichable).
// Ces valeurs sont contrôlées depuis l'admin (back-office), pas hardcodées côté app.
import { apiGet } from './client';

export type PublicPlatformSettings = {
  minCardAmount: number;       // FCFA
  cardSendFeeFixed: number;    // FCFA — forfait Donia ajoute au montant envoye (sur les cartes)
  minWithdrawalAmount: number; // FCFA
  withdrawalFeeFixed: number;  // FCFA — forfait Donia ajoute au montant retire (0 par defaut)
  maxAmountNoKyc: number;      // FCFA
  commissionRate: number;      // %
  referralLifetimeActive: boolean;
};

export function getPlatformSettings(): Promise<PublicPlatformSettings> {
  return apiGet<PublicPlatformSettings>('/v1/public/settings');
}
