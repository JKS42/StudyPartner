import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const DEFAULT_CHANNEL_ID = 'studypartner-default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Study reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
      sound: 'default',
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await setupNotificationChannels();

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const EXPO_PROJECT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getExpoProjectId(): string | undefined {
  const raw =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined;

  if (!raw || !EXPO_PROJECT_ID_RE.test(raw)) return undefined;
  return raw;
}

export async function getExpoPushToken(): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn(
      'Remote push is disabled: set a valid EAS project UUID in app.json (extra.eas.projectId). Run `cd apps/mobile && npx eas init` while logged into Expo, then restart the dev server.'
    );
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (e) {
    console.warn('Failed to get Expo push token:', e);
    return null;
  }
}

export async function registerPushToken(userId: string): Promise<string | null> {
  const token = await getExpoPushToken();
  if (!token) return null;

  const deviceId = Constants.sessionId ?? Device.modelName ?? 'unknown';
  const platform =
    Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
      ? Platform.OS
      : 'unknown';

  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      expo_push_token: token,
      device_id: deviceId,
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,expo_push_token' }
  );

  if (error) throw error;

  await supabase
    .from('profiles')
    .update({ push_notifications_enabled: true })
    .eq('id', userId);

  return token;
}

export async function unregisterPushTokens(userId: string): Promise<void> {
  await supabase.from('push_tokens').delete().eq('user_id', userId);
  await supabase
    .from('profiles')
    .update({
      push_notifications_enabled: false,
      local_reminders_enabled: false,
    })
    .eq('id', userId);
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleStudyReminder(hour = 18): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to study',
      body: 'Keep your streak going — open StudyPartner for a quick session.',
      data: { url: '/(tabs)/study' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
      channelId: DEFAULT_CHANNEL_ID,
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase
      .from('profiles')
      .update({ local_reminders_enabled: true, reminder_hour: hour })
      .eq('id', userData.user.id);
  }

  return true;
}

export async function cancelLocalReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase
      .from('profiles')
      .update({ local_reminders_enabled: false })
      .eq('id', userData.user.id);
  }
}

export async function sendTestPush(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const functionsUrl =
    process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ??
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

  const response = await fetch(`${functionsUrl}/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({
      title: 'StudyPartner',
      body: 'Push notifications are working!',
      data: { url: '/(tabs)' },
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? 'Failed to send test push');
  }
}

export function parseNotificationUrl(data: Record<string, unknown>): string | null {
  const url = data?.url;
  return typeof url === 'string' && url.length > 0 ? url : null;
}
