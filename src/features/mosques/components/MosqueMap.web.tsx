import React from 'react';

import { Mosque } from '../types';

type Props = {
  mosques: Mosque[];
  onSelect: (m: Mosque) => void;
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
};

/**
 * Web stub. `react-native-maps` is a native-only module and can't be bundled for
 * web, so on web we render nothing here (the list view is shown instead). Metro
 * resolves this `.web` file on the web platform, keeping react-native-maps out
 * of the web bundle entirely.
 */
export function MosqueMap(_props: Props) {
  return null;
}
