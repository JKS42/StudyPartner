import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  parseNotificationUrl,
  registerPushToken,
  setupNotificationChannels,
} from '../lib/notifications';

/**
 * Registers push tokens when the user is signed in and handles notification taps.
 */
export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);
  const registeredFor = useRef<string | null>(null);

  useEffect(() => {
    setupNotificationChannels().catch(console.warn);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      registeredFor.current = null;
      return;
    }
    if (registeredFor.current === user.id) return;

    registerPushToken(user.id)
      .then(() => {
        registeredFor.current = user.id;
      })
      .catch(console.warn);
  }, [user?.id]);

  useEffect(() => {
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const url = parseNotificationUrl(
        response.notification.request.content.data as Record<string, unknown>
      );
      if (url) {
        router.push(url as never);
      }
    };

    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    return () => sub.remove();
  }, []);
}
