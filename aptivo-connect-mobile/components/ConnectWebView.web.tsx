import { StyleSheet, Text, View } from 'react-native';

/**
 * react-native-webview is a native container. A browser preview cannot host a
 * second WebView, so keep it intentionally informational rather than crashing.
 */
export default function ConnectWebView() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Aptivo Connect</Text>
      <Text style={styles.copy}>This thin wrapper runs in an Android or iOS development build.</Text>
      <Text style={styles.detail}>Use Expo Go or an EAS development build to open Connect.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F6F1', padding: 28, gap: 12 },
  brand: { color: '#174D3A', fontSize: 26, fontWeight: '700' },
  copy: { color: '#18201C', fontSize: 16, textAlign: 'center', maxWidth: 320 },
  detail: { color: '#69736D', fontSize: 14, textAlign: 'center', maxWidth: 320 },
});
