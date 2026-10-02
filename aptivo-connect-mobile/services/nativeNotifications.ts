import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type * as Notifications from 'expo-notifications';

type NotificationModule = typeof Notifications;

/**
 * Remote notification APIs are absent from Expo Go on Android SDK 53+.
 * Load them only in a custom development or production build so Expo Go can
 * still run the WebView shell for ordinary wrapper testing.
 */
export function getNativeNotifications(): NotificationModule | null {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as NotificationModule;
}
