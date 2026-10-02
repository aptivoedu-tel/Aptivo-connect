import PushDevice from '@/lib/models/PushDevice';

type PushEvent = {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  route: string;
  type: string;
  conversationId?: string;
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function channelFor(event: PushEvent) {
  if (event.conversationId) return 'messages';
  if (event.type === 'link') return 'connections';
  return 'aptivo-activity';
}

/**
 * Best-effort Expo delivery. The database notification and realtime event are
 * authoritative; a provider failure never rolls back the underlying action.
 */
export class PushService {
  static async dispatch(event: PushEvent) {
    const devices = await PushDevice.find({ userId: event.userId, enabled: true }).lean();
    const messages = devices
      .filter((device) => /^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/.test(device.token))
      .map((device) => ({
        to: device.token,
        title: event.title.slice(0, 120),
        body: event.message.slice(0, 140),
        sound: 'default',
        channelId: channelFor(event),
        data: {
          notificationId: event.notificationId,
          type: event.type,
          targetRoute: event.route,
          conversationId: event.conversationId,
        },
      }));

    if (!messages.length) return;

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(process.env.EXPO_PUSH_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_PUSH_ACCESS_TOKEN}` } : {}),
        },
        body: JSON.stringify(messages),
      });
      if (!response.ok) return;
      const result = await response.json() as { data?: Array<{ status?: string; details?: { error?: string } }> };
      await Promise.all((result.data || []).map((receipt, index) =>
        receipt.details?.error === 'DeviceNotRegistered'
          ? PushDevice.updateOne({ token: messages[index]?.to }, { $set: { enabled: false } })
          : Promise.resolve()
      ));
    } catch {
      // Push is intentionally non-blocking and must not affect the product action.
    }
  }
}

export default PushService;
