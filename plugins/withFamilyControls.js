/**
 * Expo config plugin: withFamilyControls
 * --------------------------------------
 * Adds the iOS bits required for the (scaffolded) Screen Time / app-blocking
 * feature used by Prayer Lock:
 *
 *   • the `com.apple.developer.family-controls` entitlement, and
 *   • an Info.plist usage note.
 *
 * This is iOS-only and a NO-OP on Android / web. It only writes config — it does
 * NOT make app-blocking work on its own. Real blocking additionally needs:
 *   1. Apple to APPROVE the Family Controls entitlement for this bundle id
 *      (request via the Apple Developer portal — distribution requires approval).
 *   2. A `DeviceActivityMonitor` app-extension target (added in Xcode / a future
 *      native module), and
 *   3. A custom dev/prod build via `eas build` — it does NOT run in Expo Go.
 *
 * See docs/IOS_APP_LOCK.md for the full, honest checklist.
 *
 * Until the entitlement is approved, leaving this plugin enabled is harmless for
 * development, but you should only ship it once Apple has granted access.
 */
const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const FAMILY_CONTROLS_ENTITLEMENT = 'com.apple.developer.family-controls';

function withFamilyControls(config) {
  // 1) Entitlement (iOS only — withEntitlementsPlist is a no-op on other platforms).
  config = withEntitlementsPlist(config, (cfg) => {
    cfg.modResults[FAMILY_CONTROLS_ENTITLEMENT] = true;
    return cfg;
  });

  // 2) A human-readable usage note in Info.plist (optional but tidy).
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.AtharFamilyControlsUsage =
      'Athar can optionally shield distracting apps during prayer times to help you focus on your salah.';
    return cfg;
  });

  return config;
}

module.exports = withFamilyControls;
