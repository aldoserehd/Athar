import React from 'react';

import { Mosque } from '../types';

type Props = {
  mosques: Mosque[];
  center: { latitude: number; longitude: number };
  onSelect: (id: string) => void;
  height?: number;
};

/**
 * Web stub — the WebView map is native-only, so on web we render nothing and the
 * list view is shown instead. Metro resolves this `.web` file on web.
 */
export function MosqueMap(_props: Props) {
  return null;
}
