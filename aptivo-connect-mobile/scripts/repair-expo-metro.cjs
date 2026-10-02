/*
 * Expo SDK 57.0.3 currently publishes @expo/metro-file-map without the
 * JavaScript implementation of AbstractWatcher (the .d.ts is present).
 * Metro cannot start on Windows without it. Expo already installs Metro's
 * matching implementation, so copy that exact runtime dependency only when
 * the upstream package omits it. Remove this script once Expo ships the file.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules', 'metro-file-map', 'src', 'watchers', 'AbstractWatcher.js');
const destination = path.join(root, 'node_modules', '@expo', 'metro-file-map', 'build', 'watchers', 'AbstractWatcher.js');

if (!fs.existsSync(destination) && fs.existsSync(source)) {
  fs.copyFileSync(source, destination);
  process.stdout.write('Restored missing Expo Metro AbstractWatcher runtime file.\n');
}
