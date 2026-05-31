import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Screen } from '../src/components/Screen';
import { signOut } from '../src/hooks/useAuth';
import { useProfile, useUpdateProfile } from '../src/hooks/useProfile';
import { getProfileHandle } from '../src/lib/profile';
import {
  cancelLocalReminders,
  registerPushToken,
  scheduleStudyReminder,
  sendTestPush,
  unregisterPushTokens,
} from '../src/lib/notifications';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';
import type { ThemePreference } from '../src/types/database';
import { useAppTheme } from '../src/theme';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [school, setSchool] = useState('');
  const [subjects, setSubjects] = useState('');
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '');
      setDisplayName(profile.display_name ?? '');
      setSchool(profile.school ?? '');
      setSubjects((profile.subjects ?? []).join(', '));
      setThemePreference(profile.theme);
    }
  }, [profile, setThemePreference]);

  const saveProfile = async () => {
    setUsernameError(undefined);
    try {
      await updateProfile.mutateAsync({
        username: username.trim() ? username : null,
        display_name: displayName.trim() || null,
        school: school || null,
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      if (message.toLowerCase().includes('username')) {
        setUsernameError(message);
      }
      Alert.alert('Error', message);
    }
  };

  const cycleTheme = async () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const current = profile?.theme ?? 'system';
    const next = order[(order.indexOf(current) + 1) % order.length];
    setThemePreference(next);
    await updateProfile.mutateAsync({ theme: next });
  };

  const enablePush = async () => {
    if (!user?.id) return;
    setPushBusy(true);
    try {
      const token = await registerPushToken(user.id);
      if (!token) {
        Alert.alert(
          'Permission needed',
          'Allow notifications on a physical device. Expo Go has limited push support — use an EAS development build for full push.'
        );
        return;
      }
      Alert.alert('Push enabled', 'You will receive study reminders and streak alerts.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setPushBusy(false);
    }
  };

  const disablePush = async () => {
    if (!user?.id) return;
    setPushBusy(true);
    try {
      await unregisterPushTokens(user.id);
      Alert.alert('Push disabled', 'Notifications turned off for this account.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setPushBusy(false);
    }
  };

  const handleLocalReminder = async () => {
    const hour = profile?.reminder_hour ?? 18;
    const ok = await scheduleStudyReminder(hour);
    Alert.alert(
      ok ? 'Local reminder on' : 'Permission needed',
      ok ? `Daily reminder at ${hour}:00 on this device.` : 'Enable notifications in system settings.'
    );
  };

  const handleTestPush = async () => {
    setPushBusy(true);
    try {
      await sendTestPush();
      Alert.alert('Sent', 'Check your device for the test notification.');
    } catch (e) {
      Alert.alert(
        'Test failed',
        e instanceof Error ? e.message : 'Deploy the send-push Edge Function and run the push migration first.'
      );
    } finally {
      setPushBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (user?.id) {
      await supabase.from('push_tokens').delete().eq('user_id', user.id);
    }
    await signOut();
    router.replace('/(auth)/login');
  };

  const pushOn = profile?.push_notifications_enabled ?? false;
  const localOn = profile?.local_reminders_enabled ?? false;

  return (
    <Screen title="Settings" scroll>
      <Input
        label="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text.replace(/^@/, '').toLowerCase());
          setUsernameError(undefined);
        }}
        placeholder="studyhero"
        autoCapitalize="none"
        autoCorrect={false}
        error={usernameError}
      />
      <Text style={[styles.hint, { color: theme.textMuted }]}>
        {getProfileHandle({ username: username || null }) ?? '@username'} · 3–20 characters, letters, numbers, underscores
      </Text>
      <Input label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Optional full name" />
      <Input label="School" value={school} onChangeText={setSchool} />
      <Input label="Subjects (comma-separated)" value={subjects} onChangeText={setSubjects} />

      <Button title="Save profile" onPress={saveProfile} loading={updateProfile.isPending} />
      <Button title={`Theme: ${profile?.theme ?? 'system'}`} variant="secondary" onPress={cycleTheme} />

      <Text style={[styles.section, { color: theme.text }]}>Notifications</Text>
      <View style={[styles.statusRow, { borderColor: theme.border }]}>
        <Text style={{ color: theme.textMuted }}>
          Push: {pushOn ? 'On' : 'Off'} · Local: {localOn ? 'On' : 'Off'}
        </Text>
      </View>

      {!pushOn ? (
        <Button title="Enable push notifications" onPress={enablePush} loading={pushBusy} />
      ) : (
        <>
          <Button title="Send test push" variant="secondary" onPress={handleTestPush} loading={pushBusy} />
          <Button title="Disable push notifications" variant="ghost" onPress={disablePush} loading={pushBusy} />
        </>
      )}

      {!localOn ? (
        <Button title="Enable daily local reminder (6 PM)" variant="secondary" onPress={handleLocalReminder} />
      ) : (
        <Button title="Disable local reminders" variant="ghost" onPress={cancelLocalReminders} />
      )}

      <Text style={[styles.version, { color: theme.textMuted }]}>StudyPartner v1.0.0</Text>
      <Button title="Sign out" variant="ghost" onPress={handleSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  statusRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  version: { textAlign: 'center', marginVertical: 24, fontSize: 13 },
  hint: { fontSize: 13, marginTop: -8, marginBottom: 12 },
});
