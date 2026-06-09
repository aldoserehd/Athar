import { NativeModules, Platform } from 'react-native';

/**
 * Thin JS interface to a (future) native iOS Screen Time / Family Controls
 * module that can *actually* shield/block selected apps during prayer windows.
 *
 * IMPORTANT — this is a SCAFFOLD, not a working blocker. Real app-blocking on
 * iOS requires Apple's `FamilyControls` + `ManagedSettings` + `DeviceActivity`
 * frameworks, the `com.apple.developer.family-controls` entitlement (which Apple
 * must approve), a `DeviceActivityMonitor` app-extension target, and a custom
 * `eas build` (it does NOT work in Expo Go). See docs/IOS_APP_LOCK.md.
 *
 * Until that native module ships and Apple approves the entitlement, every call
 * here resolves to a clear "not available" result so the JS never crashes. The
 * cross-platform commitment gate (PrayerLockOverlay) is the working fallback.
 */

export type ScreenTimeResult = {
  ok: boolean;
  /** Machine-readable reason when not ok (e.g. 'unsupported-platform'). */
  reason?: 'unsupported-platform' | 'module-missing' | 'denied' | 'error';
  message?: string;
};

export type ShieldWindow = { startMs: number; endMs: number };

// The native module, if a custom build has linked it. Absent in Expo Go / web /
// Android — in which case we degrade gracefully.
const Native: any =
  Platform.OS === 'ios' ? (NativeModules as any).AtharScreenTime ?? null : null;

const NOT_AVAILABLE: ScreenTimeResult = {
  ok: false,
  reason: Platform.OS === 'ios' ? 'module-missing' : 'unsupported-platform',
  message:
    'Native app-blocking is not available on this build. Using the in-app commitment gate instead.',
};

/** True only when running on iOS with the native module linked in a custom build. */
export async function isSupported(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !Native) return false;
  try {
    return Boolean(await Native.isSupported());
  } catch {
    return false;
  }
}

/** Request Family Controls authorization (prompts the user). No-op if unsupported. */
export async function requestAuthorization(): Promise<ScreenTimeResult> {
  if (!Native) return NOT_AVAILABLE;
  try {
    const granted = await Native.requestAuthorization();
    return granted ? { ok: true } : { ok: false, reason: 'denied' };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: String(e?.message ?? e) };
  }
}

/** Present the system FamilyActivityPicker so the user chooses apps to block. */
export async function pickAppsToBlock(): Promise<ScreenTimeResult> {
  if (!Native) return NOT_AVAILABLE;
  try {
    await Native.pickAppsToBlock();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: String(e?.message ?? e) };
  }
}

/** Start shielding the chosen apps for a prayer window. */
export async function startShield(window: ShieldWindow): Promise<ScreenTimeResult> {
  if (!Native) return NOT_AVAILABLE;
  try {
    await Native.startShield(window.startMs, window.endMs);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: String(e?.message ?? e) };
  }
}

/** Lift any active shield. */
export async function stopShield(): Promise<ScreenTimeResult> {
  if (!Native) return NOT_AVAILABLE;
  try {
    await Native.stopShield();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: String(e?.message ?? e) };
  }
}
