import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';
import { LocationSetupScreen } from './LocationSetupScreen';

const mockGoBack = jest.fn();
let mockPrayerState: Record<string, unknown>;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, setOptions: jest.fn() }),
}));

jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: () => ({
    language: 'en',
    isRTL: false,
    t: (key: string) =>
      ({
        'locationSetup.title': 'Prayer location',
        'locationSetup.permissionTitle': 'Allow location access',
        'locationSetup.permissionDesc': 'Your coordinates stay on this device.',
        'locationSetup.openSettings': 'Open system settings',
        'locationSetup.tryAgain': 'Try again',
        'locationSetup.manualTitle': 'Search for a city instead',
        'locationSetup.searchPlaceholder': 'City and country',
        'locationSetup.search': 'Search',
        'locationSetup.currentTitle': 'Prayer location ready',
        'locationSetup.localTimezone': 'Local time zone and daylight saving applied',
        'locationSetup.useCurrent': 'Use current location',
        'locationSetup.attribution': 'Search data © OpenStreetMap contributors',
      })[key] ?? key,
  }),
  useT: () => (key: string) => key,
}));

jest.mock('@/features/prayer', () => ({
  usePrayer: () => mockPrayerState,
  searchManualPlaces: jest.fn(),
  manualPlaceFromResult: jest.fn(),
}));

function state(overrides: Record<string, unknown> = {}) {
  return {
    place: null,
    locationStatus: 'needsPermission',
    canAskAgain: false,
    loading: false,
    refreshLocation: jest.fn(),
    setManualPlace: jest.fn(),
    ...overrides,
  };
}

function renderScreen() {
  return render(
    <ThemeProvider>
      <LocationSetupScreen />
    </ThemeProvider>,
  );
}

describe('LocationSetupScreen recovery states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens system settings when the OS will not show the permission prompt again', () => {
    mockPrayerState = state();
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    const screen = renderScreen();

    fireEvent.press(screen.getByText('Open system settings'));

    expect(openSettings).toHaveBeenCalledTimes(1);
  });

  it('retries a location fix when permission exists but no position is available', () => {
    const refreshLocation = jest.fn();
    mockPrayerState = state({
      locationStatus: 'needsLocation',
      canAskAgain: true,
      refreshLocation,
    });
    const screen = renderScreen();

    fireEvent.press(screen.getByText('Try again'));

    expect(refreshLocation).toHaveBeenCalledTimes(1);
  });

  it('shows the trusted place and confirms local-time handling when setup is complete', () => {
    mockPrayerState = state({
      locationStatus: 'ready',
      place: {
        city: 'Kuwait City, Kuwait',
        timezone: 'Asia/Kuwait',
        source: 'manual',
      },
    });
    const screen = renderScreen();

    expect(screen.getByText('Kuwait City, Kuwait')).toBeTruthy();
    expect(screen.getByText('Local time zone and daylight saving applied')).toBeTruthy();
  });
});
