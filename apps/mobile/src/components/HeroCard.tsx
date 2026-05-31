import { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface HeroCardProps {
  label: string;
  value: string;
  footer?: string;
  badge?: string;
  style?: ViewStyle;
  children?: ReactNode;
}

export function HeroCard({ label, value, footer, badge, style, children }: HeroCardProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.primary, shadowColor: theme.shadow }, style]}>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  label: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  value: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  footer: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
});
