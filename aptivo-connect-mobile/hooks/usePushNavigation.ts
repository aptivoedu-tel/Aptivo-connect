import { useEffect } from 'react';
import { Platform } from 'react-native';
import { pushRouteFromData } from '../services/deepLinks';
import { getNativeNotifications } from '../services/nativeNotifications';
import type * as Notifications from 'expo-notifications';

let pendingUrl: string | null = null;
let webReady = false;
let navigate: ((url: string) => void) | null = null;

export function setWebNavigationHandler(handler: ((url: string) => void) | null, ready = false) {
  navigate = handler;
  webReady = ready;
  if (ready && pendingUrl && navigate) { navigate(pendingUrl); pendingUrl = null; }
}

function consumeNotification(notification: Notifications.Notification) {
  const url = pushRouteFromData(notification.request.content.data);
  if (!url) return;
  if (webReady && navigate) navigate(url); else pendingUrl = url;
}

export function usePushNavigation() {
  useEffect(() => {
    // Expo's native notification response APIs are unavailable in web previews.
    // The browser is only a development surface; push routing remains native.
    if (Platform.OS === 'web') return;
    const notificationApi = getNativeNotifications();
    if (!notificationApi) return;
    const initial = notificationApi.getLastNotificationResponse();
    if (initial?.notification) consumeNotification(initial.notification);
    const subscription = notificationApi.addNotificationResponseReceivedListener((response) => consumeNotification(response.notification));
    return () => subscription.remove();
  }, []);
}
