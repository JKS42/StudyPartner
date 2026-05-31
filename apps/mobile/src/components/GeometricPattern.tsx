import { StyleSheet, View } from 'react-native';
import { palette } from '../theme/colors';

interface GeometricPatternProps {
  height?: number;
}

/** Decorative circles pattern — splash / auth header */
export function GeometricPattern({ height = 220 }: GeometricPatternProps) {
  return (
    <View style={[styles.wrap, { height }]}>
      <View style={[styles.circle, styles.c1]} />
      <View style={[styles.circle, styles.c2]} />
      <View style={[styles.circle, styles.c3]} />
      <View style={[styles.circle, styles.c4]} />
      <View style={[styles.circle, styles.c5]} />
      <View style={[styles.circle, styles.c6]} />
      <View style={[styles.quarter, styles.q1]} />
      <View style={[styles.quarter, styles.q2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: palette.navy,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  c1: { width: 90, height: 90, backgroundColor: palette.orange, top: 20, left: 24 },
  c2: { width: 56, height: 56, backgroundColor: palette.navy, top: 48, left: 120 },
  c3: { width: 72, height: 72, backgroundColor: palette.teal, top: 12, right: 40 },
  c4: { width: 48, height: 48, backgroundColor: palette.yellow, top: 100, left: 60 },
  c5: { width: 64, height: 64, backgroundColor: palette.coral, top: 90, right: 100 },
  c6: { width: 40, height: 40, backgroundColor: palette.blue, top: 140, right: 30 },
  quarter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 999,
  },
  q1: {
    backgroundColor: palette.orangeLight,
    top: 60,
    left: 200,
    transform: [{ scaleX: 0.5 }],
  },
  q2: {
    backgroundColor: palette.tealLight,
    bottom: 10,
    left: 20,
    width: 100,
    height: 100,
  },
});
