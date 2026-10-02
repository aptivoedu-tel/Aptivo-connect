import connectToDatabase from '../db';
import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

export type NotificationEventType =
  | 'MEETING_SCHEDULED'
  | 'MEETING_REMINDER'
  | 'PROJECT_APPLICATION_ACCEPTED'
  | 'PROJECT_UPDATE'
  | 'EXPERIENCE_SELECTED'
  | 'EVENT_REMINDER'
  | 'REGISTRATION_CONFIRMED'
  | 'CAMPUS_DEMAND_ACTIONED'
  | 'LINK_REQUEST'
  | 'LINK_ACCEPTED';

export interface NotificationPayload {
  userId: string | mongoose.Types.ObjectId;
  eventType: NotificationEventType;
  title: string;
  message: string;
  details?: Record<string, string | number>;
  link?: string;
  conversationId?: string | mongoose.Types.ObjectId;
  isRead?: boolean;
  type?: 'meetup' | 'meet' | 'build' | 'experience' | 'access' | 'link' | 'system';
}

export interface DispatchedLog {
  id: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  eventType: NotificationEventType;
  inApp: boolean;
  emailDispatched: boolean;
  whatsAppDispatched: boolean;
  whatsAppMessagePreview: string;
  sentAt: Date;
}

// In-memory persistent logs of multi-channel dispatches for Admin viewing
declare global {
  // eslint-disable-next-line no-var
  var dispatchLogs: DispatchedLog[] | undefined;
}

if (!global.dispatchLogs) {
  global.dispatchLogs = [];
}

export class NotificationEngine {
  public static async dispatch(payload: NotificationPayload): Promise<DispatchedLog> {
    await connectToDatabase();

    const user = await User.findById(payload.userId);
    const recipientName = user?.name || 'Student';
    const recipientEmail = user?.email || 'student@aptivo.pk';
    const recipientPhone = user?.whatsapp || user?.phone || '+92 300 1234567';

    // 1. In-App Notification (Database)
    const notificationDoc = await Notification.create({
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'system',
      link: payload.link || '/dashboard',
      conversationId: payload.conversationId,
      isRead: payload.isRead === true,
    });

    // 1b. Publish Ably Realtime Notification Event
    try {
      const { publishUserEvent } = await import('../realtime');
      await publishUserEvent(payload.userId, 'notification.created', notificationDoc.toObject());
    } catch {}

    // Native delivery is deliberately best-effort. The persisted notification
    // and Ably event above remain the source of truth when a provider is down.
    void import('./pushService').then(({ PushService }) => PushService.dispatch({
      notificationId: String(notificationDoc._id),
      userId: String(payload.userId),
      title: payload.title,
      message: payload.message,
      route: payload.link?.startsWith('/') ? payload.link : '/dashboard/notifications',
      type: payload.type || 'system',
      conversationId: payload.conversationId ? String(payload.conversationId) : undefined,
    })).catch(() => {});

    // 2. Multi-Channel WhatsApp Template Formatter
    const whatsAppPreview = `*Aptivo Connect Alert*\n\n${payload.title}\n\n${payload.message}\n${
      payload.details
        ? Object.entries(payload.details)
            .map(([k, v]) => `• ${k}: ${v}`)
            .join('\n')
        : ''
    }\n\n*Aptivo Student Opportunity Hub* • View: https://connect.aptivo.pk${payload.link || ''}`;

    const log: DispatchedLog = {
      id: new mongoose.Types.ObjectId().toString(),
      recipientName,
      recipientEmail,
      recipientPhone,
      eventType: payload.eventType,
      inApp: true,
      emailDispatched: true,
      whatsAppDispatched: true,
      whatsAppMessagePreview: whatsAppPreview,
      sentAt: new Date(),
    };

    global.dispatchLogs?.unshift(log);
    if ((global.dispatchLogs?.length || 0) > 50) {
      global.dispatchLogs?.pop();
    }

    return log;
  }

  public static getRecentDispatches(): DispatchedLog[] {
    return global.dispatchLogs || [];
  }
}

export default NotificationEngine;
