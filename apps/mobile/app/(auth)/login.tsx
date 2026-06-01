import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/Button';
import { GeometricPattern } from '../../src/components/GeometricPattern';
import { Input } from '../../src/components/Input';
import { signInWithEmail, signInWithGoogle } from '../../src/hooks/useAuth';
import { isSupabaseConfigured } from '../../src/lib/supabase';
import { palette, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert('Setup required', 'Add Supabase keys to apps/mobile/.env');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert('Setup required', 'Add Supabase keys to apps/mobile/.env');
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Google sign-in failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <GeometricPattern height={180} />
      <View style={styles.form}>
        <BrandLogo size="sm" />
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to continue studying</Text>

        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.edu"
        />
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        <Button title="Sign in" onPress={handleLogin} loading={loading} />
        <View style={styles.gap} />
        <Button title="Continue with Google" variant="secondary" onPress={handleGoogle} />

        <Link href="/(auth)/forgot-password" style={styles.link}>
          <Text style={styles.linkAccent}>Forgot password?</Text>
        </Link>
        <Link href="/(auth)/signup" style={styles.link}>
          <Text style={styles.linkMuted}>
            New to StudyPartner? <Text style={styles.linkAccent}>Create an account</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy },
  content: { flexGrow: 1 },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },
  heading: { ...typography.h1, marginTop: spacing.lg, marginBottom: 6, color: palette.white },
  sub: { ...typography.body, color: 'rgba(255,255,255,0.75)', marginBottom: spacing.lg },
  gap: { height: 12 },
  link: { marginTop: 20, alignSelf: 'center' },
  linkAccent: { color: palette.orangeLight, fontWeight: '600' },
  linkMuted: { color: 'rgba(255,255,255,0.75)' },
});
