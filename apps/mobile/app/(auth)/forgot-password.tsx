import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Button } from '../../src/components/Button';
import { GeometricPattern } from '../../src/components/GeometricPattern';
import { Input } from '../../src/components/Input';
import { resetPassword } from '../../src/hooks/useAuth';
import { palette, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPassword(email.trim());
      Alert.alert('Check your email', 'We sent a password reset link.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <GeometricPattern height={140} />
      <View style={styles.form}>
        <BrandLogo size="sm" />
        <Text style={styles.heading}>Reset password</Text>
        <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Button title="Send reset link" onPress={handleReset} loading={loading} />
        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkAccent}>Back to sign in</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy },
  content: { flexGrow: 1 },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },
  heading: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.lg, color: palette.white },
  link: { marginTop: 24, alignSelf: 'center' },
  linkAccent: { color: palette.orangeLight, fontWeight: '600' },
});
