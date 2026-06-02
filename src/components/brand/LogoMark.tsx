// LogoMark — logo officiel Donia (5 paths SVG)
// Source : _prototype/donia/project/logo-mark.svg (260x413 viewBox)
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ViewStyle, View } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export function LogoMark({ size = 80, style }: Props) {
  const w = size;
  const h = size * (413 / 260);
  const gradId = `donia-bg-${size}`;
  return (
    <View style={[{ width: w, height: h }, style]}>
      <Svg width={w} height={h} viewBox="0 0 260 413">
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FDF7F6" />
            <Stop offset="100%" stopColor="#F8E6E2" />
          </LinearGradient>
        </Defs>
        {/* Outer rounded mark frame */}
        <Path
          d="M0,0 L137,0 L152,3 L166,10 L174,17 L181,27 L186,38 L188,46 L188,186 L185,198 L178,211 L169,221 L159,227 L150,231 L137,233 L-1,233 L-18,229 L-29,223 L-37,216 L-44,206 L-46,202 L-46,32 L-41,23 L-32,13 L-23,7 L-15,3 Z"
          fill={`url(#${gradId})`}
          transform="translate(46,51)"
        />
        {/* Pink swirl (primary) */}
        <Path
          d="M0,0 L72,0 L86,2 L97,6 L113,14 L124,22 L133,31 L142,45 L146,54 L149,67 L149,92 L145,102 L138,110 L129,117 L114,124 L116,119 L123,105 L127,88 L127,70 L122,54 L113,41 L102,33 L94,29 L81,25 L69,23 L50,22 L27,22 L22,41 L20,51 L18,58 L16,69 L12,84 L11,91 L2,93 L-8,77 L-17,69 L-25,69 L-27,71 L-26,76 L-22,82 L-12,89 L0,95 L5,97 L17,95 L33,91 L62,84 L84,79 L102,75 L106,76 L108,105 L108,126 L91,132 L75,136 L60,140 L38,147 L27,152 L16,158 L7,164 L4,163 L1,133 L-1,120 L-2,102 L-17,110 L-25,118 L-29,127 L-29,141 L-35,136 L-44,123 L-44,114 L-40,108 L-33,102 L-22,98 L-11,96 L-23,92 L-34,86 L-39,80 L-40,78 L-40,68 L-35,62 L-30,59 L-18,59 L-9,65 L-4,72 L-3,75 L-2,2 Z"
          fill="#FC4D6B"
          transform="translate(61,85)"
        />
        {/* Pink darker swirl */}
        <Path
          d="M0,0 L4,1 L6,30 L6,51 L-11,57 L-27,61 L-42,65 L-64,72 L-75,77 L-86,83 L-95,89 L-98,88 L-101,58 L-102,55 L-102,27 L-100,22 L-103,21 L-94,22 L-57,13 L-26,6 L-13,3 Z"
          fill="#ED4373"
          transform="translate(163,160)"
        />
        {/* Gold accent */}
        <Path
          d="M0,0 L9,1 L34,6 L49,10 L62,12 L64,13 L62,23 L58,40 L55,41 L57,29 L58,25 L54,24 L51,19 L51,13 L44,12 L15,6 L11,5 L9,10 L5,12 L0,12 L-2,23 L-4,31 L-4,35 L1,15 L11,10 L13,7 L38,12 L48,14 L52,24 L56,27 L54,41 L45,44 L32,47 L29,46 L32,43 L31,36 L27,33 L27,27 L30,28 L30,31 L35,31 L33,26 L30,23 L30,19 L27,19 L27,22 L20,24 L18,26 L19,33 L28,40 L26,44 L23,44 L23,42 L20,41 L20,38 L14,37 L16,43 L20,46 L19,50 L-12,57 L-11,47 L-4,17 Z"
          fill="#FAA41E"
          transform="translate(92,117)"
        />
        {/* Plum tail */}
        <Path
          d="M0,0 L1,2 L-7,18 L-16,30 L-23,37 L-37,46 L-54,53 L-62,55 L-72,56 L-128,56 L-123,52 L-107,44 L-82,36 L-68,32 L-52,28 L-32,21 L-15,13 L-5,6 Z"
          fill="#7A298E"
          transform="translate(205,193)"
        />
      </Svg>
    </View>
  );
}
