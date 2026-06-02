// FunBackground — couche de fond illustrée animée
// Combine : 1 HibiscusBurst (top-right), 1 ConcentricRings (bottom-left),
// 4 Sparkles dispersés, 2 Squiggles, 1-2 DotClusters.
// Source : _prototype/donia/project/direction-c.jsx:117-158
import React from 'react';
import { View } from 'react-native';
import { Sparkle } from './Sparkle';
import { Squiggle } from './Squiggle';
import { DotCluster } from './DotCluster';
import { HibiscusBurst } from './HibiscusBurst';
import { ConcentricRings } from './ConcentricRings';

type Props = {
  palette?: 'cream' | 'dark';
  density?: 'normal' | 'sparse';
};

export const FunBackground = React.memo(function FunBackground({
  palette = 'cream',
  density = 'normal',
}: Props) {
  const isDark = palette === 'dark';
  const showExtraDots = density === 'normal';

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden={true}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      {/* Big background hibiscus top-right */}
      <HibiscusBurst
        size={180}
        color="#F4486F"
        anim="floatSlow"
        style={{ position: 'absolute', top: -60, right: -50, opacity: isDark ? 0.16 : 0.13 }}
      />

      {/* Concentric sun bottom-left */}
      <ConcentricRings
        size={260}
        color={isDark ? '#F9A01C' : '#41087B'}
        opacity={isDark ? 0.18 : 0.1}
        anim="spin"
        style={{ position: 'absolute', bottom: -120, left: -100 }}
      />

      {/* Sparkles scattered */}
      <Sparkle size={20} color="#F9A01C" delay={0} style={{ position: 'absolute', top: 80, left: 30 }} />
      <Sparkle size={14} color="#ED4673" delay={1.2} style={{ position: 'absolute', top: 200, right: 40 }} />
      <Sparkle size={16} color="#5DBFA0" delay={0.6} style={{ position: 'absolute', bottom: 200, left: 50 }} />
      <Sparkle size={12} color="#F4486F" delay={1.8} style={{ position: 'absolute', bottom: 80, right: 80 }} />

      {/* Squiggle accents */}
      <Squiggle
        width={60}
        color={isDark ? '#FBC4D1' : '#F4486F'}
        strokeWidth={2}
        style={{ position: 'absolute', top: 150, right: 80, opacity: 0.5 }}
      />
      <Squiggle
        width={50}
        color={isDark ? '#FBCAD8' : '#ED4673'}
        strokeWidth={2}
        delay={1}
        style={{ position: 'absolute', bottom: 320, right: 20, opacity: 0.6 }}
      />

      {/* Dot clusters */}
      <DotCluster color="#5DBFA0" style={{ position: 'absolute', top: 280, left: 20, opacity: 0.5 }} />
      {showExtraDots && (
        <DotCluster
          color="#F9A01C"
          delay={1}
          style={{ position: 'absolute', bottom: 250, right: 0, opacity: 0.4, transform: [{ rotate: '45deg' }] }}
        />
      )}
    </View>
  );
});
