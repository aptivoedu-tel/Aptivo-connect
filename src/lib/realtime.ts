import 'server-only';
import Ably from 'ably';

const key = () => { const value = process.env.ABLY_API_KEY; if (!value) throw new Error('ABLY_API_KEY is not configured.'); return value; };
export const conversationChannel = (id: string) => `conversation:${id}`;
export async function createRealtimeToken(clientId: string, channels: string[]) {
  const capabilities = Object.fromEntries([...channels, `user:${clientId}`].map((channel) => [channel, ['subscribe']]));
  return new Ably.Rest(key()).auth.createTokenRequest({ clientId, capability: JSON.stringify(capabilities), ttl: 60 * 60 * 1000 });
}
export async function publishConversationMessage(conversationId: string, message: unknown) {
  if (!process.env.ABLY_API_KEY) return;
  await new Ably.Rest(key()).channels.get(conversationChannel(conversationId)).publish('message.created', message);
}
