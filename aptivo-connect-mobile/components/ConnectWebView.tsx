import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Network from 'expo-network';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { CONNECT_URL, isApprovedConnectUrl } from '../constants/connect';
import { getPushRegistration } from '../services/notifications';
import { setWebNavigationHandler } from '../hooks/usePushNavigation';

type WebMessage = { type?: string; url?: string };

const postToWeb = (message: Record<string, unknown>) => `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(message))}}));true;`;

export default function ConnectWebView() {
  const ref = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useCallback((url: string) => ref.current?.injectJavaScript(`window.location.assign(${JSON.stringify(url)});true;`), []);

  useEffect(() => {
    setWebNavigationHandler(navigate, loaded);
    return () => setWebNavigationHandler(null);
  }, [loaded, navigate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', () => { /* Preserve the single WebView across resume. */ });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const poll = async () => setOnline((await Network.getNetworkStateAsync()).isConnected !== false);
    void poll();
    const timer = setInterval(() => void poll(), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      ref.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const onMessage = async (event: WebViewMessageEvent) => {
    let message: WebMessage | null = null;
    try { message = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (!message?.type) return;
    if (message.type === 'WEB_READY') return;
    if (message.type === 'USER_AUTHENTICATED') {
      const registration = await getPushRegistration();
      if (registration) ref.current?.injectJavaScript(postToWeb({ type: 'NATIVE_REGISTER_PUSH', ...registration }));
      return;
    }
    if (message.type === 'OPEN_EXTERNAL_URL' && typeof message.url === 'string') {
      try {
        const parsed = new URL(message.url);
        if (['https:', 'mailto:', 'tel:'].includes(parsed.protocol)) await Linking.openURL(message.url);
      } catch {}
    }
  };

  const onShouldStartLoadWithRequest = (request: WebViewNavigation) => {
    if (isApprovedConnectUrl(request.url) || request.url === 'about:blank') return true;
    try {
      const url = new URL(request.url);
      if (['https:', 'mailto:', 'tel:'].includes(url.protocol)) void Linking.openURL(request.url);
    } catch {}
    return false;
  };

  if (!CONNECT_URL) return <ConfigurationError />;

  return (
    <View style={styles.container}>
      <WebView
        key={reloadKey}
        ref={ref}
        source={{ uri: CONNECT_URL }}
        onLoadEnd={() => setLoaded(true)}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => <Loading />}
        renderError={() => <Failure onRetry={() => setReloadKey((value) => value + 1)} />}
      />
      {!online && <View style={styles.offline}><Text style={styles.offlineText}>No internet connection. Check your connection and try again.</Text><Pressable onPress={() => setReloadKey((value) => value + 1)}><Text style={styles.retry}>Retry</Text></Pressable></View>}
    </View>
  );
}

function Loading() { return <View style={styles.center}><Text style={styles.brand}>Aptivo Connect</Text><ActivityIndicator color="#174D3A" /><Text style={styles.copy}>Loading Connect…</Text></View>; }
function Failure({ onRetry }: { onRetry: () => void }) { return <View style={styles.center}><Text style={styles.brand}>Aptivo Connect</Text><Text style={styles.copy}>We could not load Connect.</Text><Pressable onPress={onRetry}><Text style={styles.retry}>Retry</Text></Pressable></View>; }
function ConfigurationError() { return <View style={styles.center}><Text style={styles.brand}>Aptivo Connect</Text><Text style={styles.copy}>This build is missing EXPO_PUBLIC_CONNECT_URL.</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F1' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#F7F6F1', padding: 28 },
  brand: { color: '#174D3A', fontSize: 24, fontWeight: '700' }, copy: { color: '#69736D', fontSize: 15, textAlign: 'center' }, retry: { color: '#174D3A', fontWeight: '700', paddingVertical: 10, paddingHorizontal: 16 },
  offline: { position: 'absolute', left: 12, right: 12, bottom: 18, borderRadius: 12, backgroundColor: '#18201C', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  offlineText: { color: '#FFFFFF', flex: 1, fontSize: 13 },
});
