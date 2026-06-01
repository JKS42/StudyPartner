import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/Button';
import { GeometricPattern } from '../../src/components/GeometricPattern';
import { Input } from '../../src/components/Input';
import { signUpWithEmail } from '../../src/hooks/useAuth';
import { palette, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
      Alert.alert('Account created', 'You can sign in now.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert('Sign up failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <GeometricPattern height={160} />
      <View style={styles.form}>
        <BrandLogo size="sm" />
        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Start organizing your study materials</Text>

        <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <Button title="Sign up" onPress={handleSignup} loading={loading} />

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkMuted}>
            Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
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
  link: { marginTop: 24, alignSelf: 'center' },
  linkAccent: { color: palette.orangeLight, fontWeight: '600' },
  linkMuted: { color: 'rgba(255,255,255,0.75)' },
});
