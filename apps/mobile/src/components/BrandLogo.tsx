import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { radius } from '../theme/colors';
import { typography } from '../theme/typography';

interface BrandLogoProps {
  size?: 'sm' | 'md';
  light?: boolean;
}

export function BrandLogo({ size = 'md', light = true }: BrandLogoProps) {
  const theme = useAppTheme();
  const isSm = size === 'sm';
  const textColor = light ? theme.text : theme.text;
  const subColor = theme.textMuted;

  return (
    <View style={styles.row}>
      <View style={[styles.mark, isSm && styles.markSm]}>
        <Text style={[styles.markText, isSm && styles.markTextSm]}>S</Text>
      </View>
      <View>
        <Text style={[styles.name, isSm && styles.nameSm, { color: textColor }]}>
          StudyPartner
        </Text>
        <Text style={[styles.tag, { color: subColor }]}>SMART STUDY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: '#E8672A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markSm: { width: 36, height: 36 },
  markText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  markTextSm: { fontSize: 18 },
  name: { ...typography.h3, fontWeight: '800' },
  nameSm: { fontSize: 15 },
  tag: { ...typography.caption, letterSpacing: 1.2, marginTop: 1 },
});
