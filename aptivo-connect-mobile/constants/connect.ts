const configuredUrl = process.env.EXPO_PUBLIC_CONNECT_URL?.trim();

export const CONNECT_URL = configuredUrl || '';

export function connectOrigin() {
  if (!CONNECT_URL) return null;
  try {
    const url = new URL(CONNECT_URL);
    return url.protocol === 'https:' ? url.origin : null;
  } catch { return null; }
}

export function isApprovedConnectUrl(value: string) {
  const origin = connectOrigin();
  try { return Boolean(origin) && new URL(value).origin === origin; } catch { return false; }
}

export function isSafeInternalRoute(value: unknown): value is string {
  return typeof value === 'string' && /^\/(?:[a-zA-Z0-9_?=&%./-]*)$/.test(value) && !value.startsWith('//');
}
