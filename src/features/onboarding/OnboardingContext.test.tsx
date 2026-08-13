import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { OnboardingProvider, useOnboarding } from './OnboardingContext';

describe('OnboardingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('starts the tab walkthrough after setup and persists only after the tour', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: OnboardingProvider });

    await waitFor(() => expect(result.current.visible).toBe(true));
    act(() => result.current.complete());

    expect(result.current.visible).toBe(false);
    expect(result.current.tourVisible).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    act(() => result.current.endTour());
    expect(result.current.tourVisible).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('athar.onboarding.v2', 'done');
  });
});
