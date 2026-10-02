/*
 * Temporary operator-run smoke test for the production realtime path.
 * Credentials are deliberately read only from the process environment and are
 * never printed or written to disk.
 */
const { performance } = require('node:perf_hooks');
const Ably = require('ably');

const baseUrl = (process.env.RT_BASE_URL || '').replace(/\/$/, '');
const accounts = [
  { label: 'A', email: process.env.RT_A_EMAIL, password: process.env.RT_A_PASSWORD },
  { label: 'B', email: process.env.RT_B_EMAIL, password: process.env.RT_B_PASSWORD },
];

if (!baseUrl || accounts.some(({ email, password }) => !email || !password)) {
  throw new Error('Set RT_BASE_URL, RT_A_EMAIL, RT_A_PASSWORD, RT_B_EMAIL, and RT_B_PASSWORD before running this test.');
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const elapsed = (start) => Math.round((performance.now() - start) * 10) / 10;

function cookiesFrom(response) {
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie') || ''];
  return values.map((value) => value.split(';')[0]).filter(Boolean).join('; ');
}

async function request(path, options = {}, cookie = '') {
  const headers = { ...(options.headers || {}) };
  if (cookie) headers.cookie = cookie;
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${payload.error || 'unknown error'}`);
  return { response, payload };
}

async function authenticate(account) {
  const { response } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: account.email, password: account.password }),
  });
  const cookie = cookiesFrom(response);
  if (!cookie) throw new Error(`Login for ${account.label} did not return a session cookie.`);
  const { payload } = await request('/api/auth/me', {}, cookie);
  const user = payload.user;
  if (!user?._id) throw new Error(`Authenticated identity for ${account.label} is missing an id.`);
  return { ...account, cookie, user };
}

function connectRealtime(account, tokenRequest) {
  return new Promise((resolve, reject) => {
    const client = new Ably.Realtime({
      authCallback: (_params, callback) => callback(null, tokenRequest),
    });
    const timeout = setTimeout(() => {
      client.close();
      reject(new Error(`${account.label} realtime client did not connect within 12 seconds.`));
    }, 12_000);
    client.connection.once('connected', () => {
      clearTimeout(timeout);
      resolve(client);
    });
    client.connection.once('failed', (stateChange) => {
      clearTimeout(timeout);
      reject(new Error(`${account.label} realtime connection failed: ${stateChange.reason?.message || 'unknown reason'}`));
    });
  });
}

async function attach(channel) {
  if (channel.state === 'attached') return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Channel ${channel.name} did not attach within 12 seconds.`)), 12_000);
    channel.once('attached', () => { clearTimeout(timeout); resolve(); });
    channel.once('failed', (change) => { clearTimeout(timeout); reject(new Error(`Channel attach failed: ${change.reason?.message || 'unknown reason'}`)); });
    channel.attach();
  });
}

async function main() {
  const started = performance.now();
  const [a, b] = await Promise.all(accounts.map(authenticate));
  console.log('T0 authenticated two distinct signed-session accounts:', a.user._id !== b.user._id ? 'PASS' : 'FAIL');
  if (a.user._id === b.user._id) throw new Error('The supplied accounts resolved to the same user.');

  const { payload: conversationResult } = await request('/api/conversations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ recipientId: String(b.user._id) }),
  }, a.cookie);
  const conversation = conversationResult.conversation || conversationResult;
  const conversationId = String(conversation._id || conversation.id || '');
  if (!conversationId) throw new Error('Conversation API did not return a conversation id.');
  const channelName = `conversation:${conversationId}`;

  const [{ payload: tokenA }, { payload: tokenB }] = await Promise.all([
    request('/api/realtime/token', {}, a.cookie),
    request('/api/realtime/token', {}, b.cookie),
  ]);
  const [clientA, clientB] = await Promise.all([
    connectRealtime(a, tokenA),
    connectRealtime(b, tokenB),
  ]);
  const channelA = clientA.channels.get(channelName);
  const channelB = clientB.channels.get(channelName);
  await Promise.all([attach(channelA), attach(channelB)]);
  console.log(`T1 both token-authenticated clients subscribed to the identical conversation channel: PASS (${elapsed(started)} ms)`);

  const typingSeen = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('B did not receive typing.start within 8 seconds.')), 8_000);
    channelB.subscribe('typing.start', (message) => {
      clearTimeout(timeout);
      resolve({ ms: elapsed(started), clientId: message.clientId });
    });
  });
  const typingPublishedAt = elapsed(started);
  await channelA.publish('typing.start', {});
  const typing = await typingSeen;
  console.log(`T2 typing.start publish ${typingPublishedAt} ms -> recipient event ${typing.ms} ms: PASS`);

  async function sendAndExpect(sender, receiver, senderChannel, receiverChannel, text) {
    const received = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`${receiver.label} did not receive message.created within 12 seconds.`)), 12_000);
      const listener = (event) => {
        if (event.data?.content !== text) return;
        clearTimeout(timeout);
        receiverChannel.unsubscribe('message.created', listener);
        resolve({ arrival: elapsed(started), message: event.data });
      };
      receiverChannel.subscribe('message.created', listener);
    });
    const tApiStart = elapsed(started);
    const { payload } = await request('/api/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        content: text,
        clientTempId: `rt-live-${Date.now()}-${sender.label}`,
      }),
    }, sender.cookie);
    const persisted = payload.message || payload;
    const tPersisted = elapsed(started);
    const event = await received;
    const idMatches = String(event.message?._id) === String(persisted?._id);
    console.log(`${sender.label}->${receiver.label}: API start ${tApiStart} ms; persisted response ${tPersisted} ms; recipient event ${event.arrival} ms; persisted message id matches event: ${idMatches ? 'PASS' : 'FAIL'}`);
    if (!idMatches) throw new Error('Realtime event did not contain the persisted message returned by the API.');
  }

  await sendAndExpect(a, b, channelA, channelB, `RT-LIVE-A-${Date.now()}`);
  await sendAndExpect(b, a, channelB, channelA, `RT-LIVE-B-${Date.now()}`);

  clientA.close();
  clientB.close();
  await wait(50);
  console.log(`T9 end-to-end bidirectional persisted-message transport: PASS (${elapsed(started)} ms total)`);
}

main().catch((error) => {
  console.error(`REALTIME LIVE TEST FAILED: ${error.message}`);
  process.exitCode = 1;
});
