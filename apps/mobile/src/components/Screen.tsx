import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';
import { spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  rightAction?: ReactNode;
  header?: ReactNode;
  padded?: boolean;
}

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  rightAction,
  header,
  padded = true,
}: ScreenProps) {
  const theme = useAppTheme();
  const pad = padded ? styles.padded : undefined;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[pad, styles.scrollBottom]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, pad]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {header}
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
            ) : null}
          </View>
          {rightAction}
        </View>
      ) : null}
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  scrollBottom: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerText: { flex: 1 },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: 4 },
});
