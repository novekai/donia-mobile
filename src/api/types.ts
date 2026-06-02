// API types — mirror backend Prisma types (kept hand-written, not auto-generated)
// Update these when backend schema changes.

export type Sex = 'F' | 'M' | 'OTHER';
export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type OtpChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';
export type TxType =
  | 'SEND' | 'RECEIVE' | 'TOPUP_MOBILE_MONEY' | 'TOPUP_CODE'
  | 'WITHDRAWAL' | 'COMMISSION' | 'REFERRAL_BONUS' | 'CAGNOTTE_IN';
export type TxStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type CardStatus = 'CREATED' | 'SENT' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
export type DeliveryChannel = 'WHATSAPP' | 'EMAIL';
export type CardPalette = 'coral' | 'indigo' | 'pink' | 'mango' | 'mint' | 'plum';

export type User = {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  sex?: Sex | null;
  dob?: string | null;
  city?: string | null;
  country: string;
  kycStatus: KycStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  referralCode: string;
  referredBy?: string | null;
  avatarUrl?: string | null;
  birthdayOptIn?: boolean;
  createdAt: string;
  wallet?: Wallet;
};

export type Wallet = {
  balancePrincipal: string;     // Decimal serialized as string
  balanceReferral: string;
  currency: string;
};

export type Card = {
  id: string;
  redeemCode: string;
  senderId: string;
  recipientId?: string | null;
  recipientPhone: string;
  recipientEmail?: string | null;
  recipientName?: string | null;
  recipientCountry: string;
  occasion: string;
  themeKey: string;
  amount: string;
  message?: string | null;
  palette: CardPalette;
  deliveryChannel: DeliveryChannel;
  commissionRate: string;
  status: CardStatus;
  sentAt?: string | null;
  redeemedAt?: string | null;
  createdAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: TxType;
  amount: string;
  currency: string;
  status: TxStatus;
  ref?: string | null;
  cardId?: string | null;
  counterpartyId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  emoji?: string | null;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: Pick<User, 'id' | 'name' | 'phone' | 'email' | 'referralCode' | 'createdAt'>;
  token: string;
  expiresAt: string;
};

// ─────────────────────────── ANONYMES ───────────────────────────

export type AnonymousLinkStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type AnonymousTheme = 'indigo' | 'coral' | 'mango' | 'pink' | 'mint';
export type AnonymousReportReason = 'HARASSMENT' | 'THREAT' | 'SPAM' | 'SEXUAL' | 'HATE' | 'OTHER';

export type AnonymousLink = {
  id: string;
  code: string;
  prompt: string;
  theme: AnonymousTheme | string;
  status: AnonymousLinkStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
};

export type AnonymousMessage = {
  id: string;
  linkId: string;
  content: string;
  isFavorite: boolean;
  readAt: string | null;
  createdAt: string;
};
