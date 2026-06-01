import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { createSessionFromAuthUrl } from '../../src/lib/authRedirect';
import { palette } from '../../src/theme/colors';

/** Handles cold-start deep links after Google OAuth (Expo Go / standalone). */
export default function AuthCallbackScreen() {
  useEffect(() => {
    const finish = async () => {
      const url = await Linking.getInitialURL();
      if (!url) {
        router.replace('/(auth)/login');
        return;
      }
      try {
        await createSessionFromAuthUrl(url);
        router.replace('/(tabs)');
      } catch {
        router.replace('/(auth)/login');
      }
    };
    void finish();
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={palette.orange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.navy },
});
