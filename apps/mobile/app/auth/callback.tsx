import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { completeOAuthFromUrl, syncSessionFromStorage } from '../../src/lib/oauthSession';
import { palette, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

function urlFromRouteParams(params: Record<string, string | string[] | undefined>): string | null {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') flat[key] = value;
    else if (Array.isArray(value) && typeof value[0] === 'string') flat[key] = value[0];
  }
  if (!flat.code && !flat.access_token && !flat.error) return null;
  const qs = new URLSearchParams(flat).toString();
  return `studypartner://auth/callback?${qs}`;
}

/** Completes Google OAuth after redirect (Expo Go, dev build, or web). */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const handled = useRef(false);
  const paramUrl = useMemo(() => urlFromRouteParams(params), [params]);

  useEffect(() => {
    if (handled.current) return;

    const finish = async (url: string | null) => {
      if (!url) return false;

      handled.current = true;
      try {
        const session = (await completeOAuthFromUrl(url)) ?? (await syncSessionFromStorage());
        if (session) {
          router.replace('/(tabs)');
          return true;
        }
      } catch {
        // fall through
      }
      router.replace('/(auth)/login');
      return true;
    };

    const run = async () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        await finish(window.location.href);
        return;
      }

      if (paramUrl && (await finish(paramUrl))) return;

      const initial = await Linking.getInitialURL();
      if (initial && (await finish(initial))) return;

      const session = await syncSessionFromStorage();
      if (session) {
        handled.current = true;
        router.replace('/(tabs)');
        return;
      }

      router.replace('/(auth)/login');
    };

    void run();

    const sub = Linking.addEventListener('url', ({ url }) => {
      void finish(url);
    });

    return () => sub.remove();
  }, [paramUrl]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={palette.orange} />
      <Text style={styles.label}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.navy,
    gap: spacing.md,
  },
  label: { ...typography.body, color: 'rgba(255,255,255,0.85)' },
});
