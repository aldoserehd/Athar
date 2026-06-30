/**
 * Expo config plugin: withoutMediaPlaybackPermission
 * --------------------------------------------------
 * `expo-audio` automatically adds the Android permission
 * `FOREGROUND_SERVICE_MEDIA_PLAYBACK` to the merged manifest. That permission is
 * meant for apps that play media in the BACKGROUND via a foreground service
 * (a music-player style persistent notification). Athar does NOT do that — it
 * plays the adhān as a notification sound and plays the full adhān in-app while
 * the app is open (foreground playback, which does not need this permission).
 *
 * Because the permission is declared, Google Play demands a demonstration video
 * and a justification for it. Since we don't actually use a media-playback
 * foreground service, we strip the permission here. Adhān notifications and
 * in-app playback are unaffected.
 *
 * Android-only; no-op elsewhere. Uses the standard manifest-merger
 * `tools:node="remove"` directive so the library-injected permission is removed
 * from the final build.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSION = 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK';

function withoutMediaPlaybackPermission(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // `tools:node="remove"` needs the tools namespace declared on <manifest>.
    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    manifest['uses-permission'] = manifest['uses-permission'] || [];
    // Drop any direct declaration, then add a remove directive so the merger
    // strips the one expo-audio injects.
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (p) => p && p.$ && p.$['android:name'] !== PERMISSION
    );
    manifest['uses-permission'].push({
      $: { 'android:name': PERMISSION, 'tools:node': 'remove' },
    });

    return cfg;
  });
}

module.exports = withoutMediaPlaybackPermission;
