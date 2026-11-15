import { useEffect, useState } from 'react';
import {
  Animated,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDesign } from '@/hooks/use-design';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, style }: SkeletonProps) {
  const tokens = useDesign();
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: tokens.surfaceMuted, opacity },
        style,
      ]}
    />
  );
}
