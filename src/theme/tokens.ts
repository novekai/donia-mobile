// Donia — Design tokens (Direction C · Afro Modern Fun)
// Source de vérité : _prototype/donia/project/tokens.css (.dir-c block)
// Toutes les couleurs sont dérivées du logo officiel.

export const colors = {
  // Brand anchor
  indigo: '#41087B',
  indigoDeep: '#2A0454',

  // Primary CTA
  coral: '#F4486F',
  coralDeep: '#D62E55',
  coralSoft: '#FBC4D1',

  // Secondary
  pink: '#ED4673',
  pinkSoft: '#FBCAD8',

  // Accents
  mango: '#F9A01C',
  mangoDeep: '#D9871F',
  plum: '#7B278C',
  plumDeep: '#5C1A6A',

  // Status
  mint: '#5DBFA0',
  mintSoft: '#BFE8D9',
  sky: '#6FB5D4',
  green: '#5C8A45',

  // Backgrounds
  bg: '#FDF7F6',
  bg2: '#F8E6E2',
  surface: '#FFFFFF',

  // Text
  ink: '#2A0F1A',
  ink2: '#6F4A5A',
  ink3: '#B59AA5',

  // Lines
  line: 'rgba(42,15,26,0.10)',
  lineSoft: 'rgba(42,15,26,0.06)',

  // Gift card palette tokens (6 variants used across the app)
  card: {
    coral:  { bg: '#F4486F', ink: '#2A0F1A', accent: '#FDF7F6', deco: '#FBC4D1' },
    indigo: { bg: '#41087B', ink: '#FDF7F6', accent: '#F9A01C', deco: '#F9A01C' },
    pink:   { bg: '#ED4673', ink: '#FDF7F6', accent: '#FDF7F6', deco: '#FBCAD8' },
    mango:  { bg: '#F9A01C', ink: '#2A0F1A', accent: '#41087B', deco: '#FDF7F6' },
    mint:   { bg: '#5DBFA0', ink: '#2A0F1A', accent: '#FDF7F6', deco: '#BFE8D9' },
    plum:   { bg: '#7B278C', ink: '#FDF7F6', accent: '#ED4673', deco: '#F9A01C' },
  },

  // Confetti palette
  confetti: ['#F4486F', '#F9A01C', '#ED4673', '#5DBFA0', '#FDF7F6', '#41087B'] as const,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const shadow = {
  e1: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  e2: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  e3: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 8 },
  // Brand-tinted shadows used heavily in the prototype
  coral: { shadowColor: '#D62E55', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.55, shadowRadius: 32, elevation: 12 },
  indigo: { shadowColor: '#41087B', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.55, shadowRadius: 36, elevation: 14 },
  mint: { shadowColor: '#5DBFA0', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.55, shadowRadius: 28, elevation: 12 },
} as const;

// Phone-frame dimensions (reference design width — iPhone 13/14 logical)
export const screen = {
  designWidth: 390,
  designHeight: 844,
} as const;

export type CardPalette = keyof typeof colors.card;
