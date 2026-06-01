import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * After OAuth sets a session while on login or /auth/callback, navigate into the app.
 */
export function AuthNavigationSync() {
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized || !session) return;

    const root = segments[0] as string | undefined;
    const onAuthFlow = root === '(auth)' || root === 'auth' || root === 'index';

    if (onAuthFlow) {
      router.replace('/(tabs)');
    }
  }, [initialized, session, segments, router]);

  return null;
}
