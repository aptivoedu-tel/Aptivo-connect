import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getNativeNotifications } from './nativeNotifications';

const INSTALLATION_KEY = 'aptivo.installation-id.v1';

const notificationApi = getNativeNotifications();
if (notificationApi) {
  notificationApi.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function getInstallationId() {
  const existing = await SecureStore.getItemAsync(INSTALLATION_KEY);
  if (existing) return existing;
  const value = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  await SecureStore.setItemAsync(INSTALLATION_KEY, value);
  return value;
}

export async function configureNotificationChannels() {
  if (Platform.OS !== 'android') return;
  const notifications = getNativeNotifications();
  if (!notifications) return;
  const channel = (id: string, name: string) => notifications.setNotificationChannelAsync(id, {
    name, importance: notifications.AndroidImportance.HIGH, sound: 'default', enableVibrate: true,
  });
  await Promise.all([channel('messages', 'Messages'), channel('connections', 'Connections'), channel('aptivo-activity', 'Aptivo Activity')]);
}

export async function getPushRegistration() {
  if (Platform.OS === 'web') return null;
  const notifications = getNativeNotifications();
  if (!notifications) return null;
  await configureNotificationChannels();
  if (!Device.isDevice) return null;
  const current = await notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) return null;
  const token = (await notifications.getExpoPushTokenAsync({ projectId })).data;
  return { token, installationId: await getInstallationId(), platform: Platform.OS as 'ios' | 'android' };
}
