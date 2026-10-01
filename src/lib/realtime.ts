import 'server-only';
import Ably from 'ably';
import mongoose from 'mongoose';

const key = () => {
  const value = process.env.ABLY_API_KEY;
  if (!value) throw new Error('ABLY_API_KEY is not configured.');
  return value;
};

export const conversationChannel = (id: string) => `conversation:${id}`;
export const userChannel = (userId: string | mongoose.Types.ObjectId) => `user:${String(userId)}`;

export async function createRealtimeToken(clientId: string, channels: string[] = []) {
  const capability: Record<string, string[]> = {
    [userChannel(clientId)]: ['subscribe', 'publish'],
    'conversation:*': ['subscribe', 'publish'],
  };
  channels.forEach((ch) => {
    capability[ch] = ['subscribe', 'publish'];
  });

  return new Ably.Rest(key()).auth.createTokenRequest({
    clientId,
    capability: JSON.stringify(capability),
    ttl: 60 * 60 * 1000,
  });
}

export async function publishConversationMessage(conversationId: string, message: unknown) {
  if (!process.env.ABLY_API_KEY) return;
  try {
    const rest = new Ably.Rest(key());
    await rest.channels.get(conversationChannel(conversationId)).publish('message.created', message);
  } catch (error) {
    console.error('Failed to publish conversation message to Ably:', error);
  }
}

export async function publishUserEvent(userId: string | mongoose.Types.ObjectId, eventName: string, payload: unknown) {
  if (!process.env.ABLY_API_KEY || !userId) return;
  try {
    const rest = new Ably.Rest(key());
    await rest.channels.get(userChannel(userId)).publish(eventName, payload);
  } catch (error) {
    console.error(`Failed to publish user event ${eventName} to Ably:`, error);
  }
}
