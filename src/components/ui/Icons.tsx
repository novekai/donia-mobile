// Icons — bibliothèque centralisée d'icônes (style Lucide stroke)
// Sources : _prototype/donia/project/phone.jsx:46-70 + direction-c.jsx (tab bar icons)
import React from 'react';
import Svg, { Polyline, Line, Path, Rect, Circle } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const baseSvg = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' });
const baseStroke = (color: string, strokeWidth: number) => ({ stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const IconChevR = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Polyline points="9 6 15 12 9 18" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconChevL = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Polyline points="15 6 9 12 15 18" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconArrowL = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Line x1="20" y1="12" x2="4" y2="12" {...baseStroke(color, strokeWidth)} />
    <Polyline points="10 6 4 12 10 18" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconBell = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...baseStroke(color, strokeWidth)} />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconPlus = ({ size = 16, color = 'currentColor', strokeWidth = 2.5 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Line x1="12" y1="5" x2="12" y2="19" {...baseStroke(color, strokeWidth)} />
    <Line x1="5" y1="12" x2="19" y2="12" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconArrowDown = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Line x1="12" y1="5" x2="12" y2="19" {...baseStroke(color, strokeWidth)} />
    <Polyline points="19 12 12 19 5 12" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconArrowUpR = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Line x1="7" y1="17" x2="17" y2="7" {...baseStroke(color, strokeWidth)} />
    <Polyline points="7 7 17 7 17 17" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconCheck = ({ size = 16, color = 'currentColor', strokeWidth = 2.5 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Polyline points="20 6 9 17 4 12" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconLock = ({ size = 12, color = 'currentColor', strokeWidth = 2.2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Rect x="4" y="11" width="16" height="11" rx="2" {...baseStroke(color, strokeWidth)} />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

// Tab bar icons (Home, Send, Wallet, History, Profile)
export const IconHome = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Path d="M3 12 12 3l9 9" {...baseStroke(color, strokeWidth)} />
    <Path d="M5 10v10h14V10" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconSend = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Polyline points="20 12 20 22 4 22 4 12" {...baseStroke(color, strokeWidth)} />
    <Rect x="2" y="7" width="20" height="5" {...baseStroke(color, strokeWidth)} />
    <Line x1="12" y1="22" x2="12" y2="7" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconWallet = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Rect x="2" y="6" width="20" height="14" rx="3" {...baseStroke(color, strokeWidth)} />
    <Path d="M2 10h20" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconHistory = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Circle cx="12" cy="12" r="10" {...baseStroke(color, strokeWidth)} />
    <Polyline points="12 6 12 12 16 14" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconProfile = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Circle cx="12" cy="8" r="4" {...baseStroke(color, strokeWidth)} />
    <Path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

// Anonyme — masque/enveloppe avec sparkle pour symboliser le mystère
export const IconAnonyme = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" {...baseStroke(color, strokeWidth)} />
    <Path d="M3 8l9 5 9-5" {...baseStroke(color, strokeWidth)} />
    <Circle cx="12" cy="13" r="1.5" fill={color} />
  </Svg>
);

export const IconCamera = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" {...baseStroke(color, strokeWidth)} />
    <Circle cx="12" cy="13" r="4" {...baseStroke(color, strokeWidth)} />
  </Svg>
);

export const IconLogout = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg {...baseSvg(size)}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...baseStroke(color, strokeWidth)} />
    <Polyline points="16 17 21 12 16 7" {...baseStroke(color, strokeWidth)} />
    <Line x1="21" y1="12" x2="9" y2="12" {...baseStroke(color, strokeWidth)} />
  </Svg>
);
