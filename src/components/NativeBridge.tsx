'use client';

import { useEffect, useRef } from 'react';

type NativeMessage = { type?: string; token?: string; platform?: 'ios' | 'android'; installationId?: string; url?: string };

function parseMessage(value: unknown): NativeMessage | null {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? parsed as NativeMessage : null;
  } catch { return null; }
}

function postToNative(message: Record<string, unknown>) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    prepareAptivoNativeLogout?: () => Promise<void>;
  }
}

/** Minimal, allow-listed bridge for the Aptivo native shell. */
export default function NativeBridge() {
  const installationId = useRef<string | null>(null);

  useEffect(() => {
    const register = async (message: NativeMessage) => {
      if (!message.token || !message.platform || !message.installationId) return;
      installationId.current = message.installationId;
      const response = await fetch('/api/push/devices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: message.token, platform: message.platform, installationId: message.installationId }),
      });
      postToNative({ type: response.ok ? 'PUSH_DEVICE_REGISTERED' : 'PUSH_DEVICE_REJECTED' });
    };
    const onMessage = (event: MessageEvent) => {
      const message = parseMessage(event.data);
      if (!message) return;
      if (message.type === 'NATIVE_REGISTER_PUSH') void register(message);
    };
    window.addEventListener('message', onMessage);
    document.addEventListener('message', onMessage as EventListener);
    window.prepareAptivoNativeLogout = async () => {
      if (!installationId.current) return;
      await fetch('/api/push/devices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ installationId: installationId.current }) });
      postToNative({ type: 'USER_LOGGED_OUT' });
      installationId.current = null;
    };
    postToNative({ type: 'WEB_READY' });
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('message', onMessage as EventListener);
      delete window.prepareAptivoNativeLogout;
    };
  }, []);

  return null;
}
