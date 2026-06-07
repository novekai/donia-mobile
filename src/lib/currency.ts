// Conversion FCFA <-> EUR
// La parité FCFA-EUR (XOF/EUR) est fixe depuis 1999 : 1 EUR = 655.957 FCFA
// (taux historique de la BCEAO). Donia utilise toujours FCFA en interne côté
// backend ; l'affichage et la saisie en EUR sont une couche de présentation.

export type Currency = 'FCFA' | 'EUR';

export const FCFA_PER_EUR = 655.957;

export function fcfaToEur(fcfa: number): number {
  return fcfa / FCFA_PER_EUR;
}

export function eurToFcfa(eur: number): number {
  return Math.round(eur * FCFA_PER_EUR);
}

// Formate un montant en string lisible :
// - FCFA : 12345 -> "12 345 FCFA"
// - EUR : 12345 (en FCFA) -> "18,82 €" (avec 2 décimales)
export function formatAmount(fcfa: number, currency: Currency): string {
  if (currency === 'EUR') {
    const eur = fcfaToEur(fcfa);
    return `${eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
  return `${Math.round(fcfa).toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`;
}

// Parse une string saisie par l'user vers FCFA (entier).
// "1500" en FCFA -> 1500
// "2,5" en EUR -> 2.5 * 655.957 = ~1640
export function parseAmountToFcfa(input: string, currency: Currency): number {
  const cleaned = input.replace(/\s/g, '').replace(',', '.');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (currency === 'EUR') return eurToFcfa(n);
  return Math.round(n);
}
