import { Redirect, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { GeometricPattern } from '../src/components/GeometricPattern';
import { useAuthStore } from '../src/stores/authStore';
import { palette, radius, spacing } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

export default function SplashScreen() {
  const initialized = useAuthStore((s) => s.initialized);
  const session = useAuthStore((s) => s.session);
  const insets = useSafeAreaInsets();

  if (!initialized) {
    return (
      <View style={styles.root}>
        <GeometricPattern height={280} />
        <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ActivityIndicator size="large" color={palette.white} />
        </View>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.root}>
      <GeometricPattern height={300} />
      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Text style={styles.heroTitle}>Gain Study Clarity</Text>
        <Text style={styles.heroSub}>
          Upload, summarize, quiz, and track progress — all from your notes.
        </Text>
        <Button
          title="Get Started"
          variant="inverse"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy },
  bottom: {
    flex: 1,
    backgroundColor: palette.orange,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.hero,
    color: palette.white,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: spacing.lg,
  },
  cta: { marginTop: spacing.sm },
});
