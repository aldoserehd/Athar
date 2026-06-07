import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, UrlTile } from 'react-native-maps';

import { useTheme } from '@/theme';
import { Mosque } from '../types';

type Props = {
  mosques: Mosque[];
  onSelect: (m: Mosque) => void;
  region: Region;
};

/**
 * Live map drawing OpenStreetMap tiles over the default base layer.
 *
 * Requires a development build — react-native-maps is a native module not in
 * Expo Go. iOS uses Apple Maps as the base with OSM tiles on top (no API key
 * needed). On Android the default base is Google Maps; add a Maps API key in
 * app.json, or switch to MapLibre for a fully Google-free OSM map.
 *
 * Heavy production traffic should use a proper tile host (MapTiler / Stadia),
 * not openstreetmap.org directly — see the OSM tile usage policy.
 */
export function MosqueMap({ mosques, onSelect, region }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={region}>
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {mosques.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.name}
            description={m.area}
            pinColor={theme.colors.primary}
            onCalloutPress={() => onSelect(m)}
            onPress={() => onSelect(m)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 320, borderRadius: 18, overflow: 'hidden' },
});
