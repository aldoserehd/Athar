import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { usePrayer } from '@/features/prayer';
import {
  FACILITIES,
  fetchMosques,
  Mosque,
  MOSQUES,
  MosqueSheet,
  MosqueSource,
  reportMosque,
} from '@/features/mosques';

// react-native-maps is a native module absent from Expo Go — load it lazily and
// only render the map in a development/standalone build.
const mapsSupported = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
let MosqueMap: React.ComponentType<{
  mosques: Mosque[];
  onSelect: (m: Mosque) => void;
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
}> | null = null;
if (mapsSupported) {
  try {
    MosqueMap = require('@/features/mosques/components/MosqueMap').MosqueMap;
  } catch {
    MosqueMap = null;
  }
}

export function MosquesScreen() {
  const theme = useTheme();
  const t = useT();
  const { place } = usePrayer();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Mosque | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>(MOSQUES);
  const [source, setSource] = useState<MosqueSource>('sample');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMosques({ latitude: place.latitude, longitude: place.longitude })
      .then(({ data, source }) => {
        if (!active) return;
        setMosques(data);
        setSource(source);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [place.latitude, place.longitude]);

  const sourceLabel =
    source === 'live' ? t('mosques.community') : source === 'osm' ? t('mosques.openstreetmap') : t('mosques.sample');
  const sourceColor =
    source === 'live' ? theme.colors.success : source === 'osm' ? theme.colors.primary : theme.colors.textFaint;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? mosques.filter((m) => (m.name + ' ' + m.area).toLowerCase().includes(q))
      : mosques;
    return [...list].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [query, mosques]);

  const region = useMemo(() => {
    const first = mosques[0];
    return {
      latitude: first?.latitude ?? 51.5074,
      longitude: first?.longitude ?? -0.1278,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }, [mosques]);

  const canMap = mapsSupported && MosqueMap !== null;

  return (
    <Screen
      scroll
      title={t('mosques.title')}
      subtitle={t('mosques.subtitle')}
      headerRight={
        canMap ? (
          <Pressable
            onPress={() => setShowMap((v) => !v)}
            style={[styles.toggle, { borderColor: theme.colors.border }]}
          >
            <Ionicons
              name={showMap ? 'list' : 'map'}
              size={16}
              color={theme.colors.primary}
            />
            <Text variant="caption" color="primary" style={{ marginLeft: 6 }}>
              {showMap ? 'List' : 'Map'}
            </Text>
          </Pressable>
        ) : undefined
      }
    >
      {/* Search */}
      <View
        style={[
          styles.search,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('mosques.searchPlaceholder')}
          placeholderTextColor={theme.colors.textFaint}
          style={[styles.input, { color: theme.colors.text, fontFamily: theme.fonts.regular }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {showMap && canMap && MosqueMap ? (
        <View style={{ marginBottom: 16 }}>
          <MosqueMap mosques={results} onSelect={setSelected} region={region} />
        </View>
      ) : !canMap ? (
        <Card alt style={styles.mapHint}>
          <Ionicons name="map-outline" size={20} color={theme.colors.primary} />
          <Text variant="caption" color="textMuted" style={{ flex: 1, marginLeft: 10 }}>
            {t('mosques.mapHint')}
          </Text>
        </Card>
      ) : null}

      <View style={styles.sectionRow}>
        <Text variant="label" color="textMuted">
          {loading
            ? t('mosques.finding')
            : `${results.length} ${results.length === 1 ? t('mosques.count') : t('mosques.countPlural')}`}
        </Text>
        <View style={[styles.sourceTag, { backgroundColor: theme.colors.surfaceContainer }]}>
          <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
          <Text variant="caption" color="textMuted">
            {sourceLabel}
          </Text>
        </View>
      </View>

      {results.map((m) => (
        <Pressable key={m.id} onPress={() => setSelected(m)} style={{ marginBottom: 12 }}>
          <Card>
            <View style={styles.cardTop}>
              <View style={styles.titleRow}>
                <Text variant="heading">{m.name}</Text>
                {m.verified ? (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                ) : null}
              </View>
              {m.distanceKm > 0 ? (
                <View style={[styles.distance, { backgroundColor: theme.colors.surfaceContainer }]}>
                  <Ionicons name="navigate-outline" size={12} color={theme.colors.textMuted} />
                  <Text variant="caption" color="textMuted" style={{ marginLeft: 4 }}>
                    {m.distanceKm} km
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
              {m.area}
            </Text>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
                <Text variant="caption" color="textMuted" style={{ marginLeft: 6 }}>
                  {t('mosques.jumuah', { time: m.jamaah.jumuah })}
                </Text>
              </View>
              <View style={styles.facilityIcons}>
                {m.facilities.slice(0, 4).map((f) => (
                  <Ionicons
                    key={f}
                    name={FACILITIES[f].icon}
                    size={15}
                    color={theme.colors.textFaint}
                    style={{ marginLeft: 8 }}
                  />
                ))}
              </View>
            </View>
          </Card>
        </Pressable>
      ))}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 10 }}>
        {t('mosques.attribution')}
      </Text>

      <MosqueSheet mosque={selected} onClose={() => setSelected(null)} onReport={reportMosque} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 16, padding: 0 },
  mapHint: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sourceTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  sourceDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  distance: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  facilityIcons: { flexDirection: 'row', alignItems: 'center' },
});
