import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { usePrayer } from '@/features/prayer';
import {
  FACILITIES,
  fetchMosques,
  Mosque,
  MosqueSheet,
  MosqueSource,
  reportMosque,
} from '@/features/mosques';

export function MosquesScreen() {
  const theme = useTheme();
  const t = useT();
  const { place } = usePrayer();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Mosque | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [source, setSource] = useState<MosqueSource>('osm');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [place.latitude, place.longitude, reloadKey]);

  const sourceLabel =
    source === 'live' ? t('mosques.community') : source === 'osm' ? t('mosques.openstreetmap') : t('mosques.sample');
  const sourceColor =
    source === 'live' ? theme.colors.success : source === 'osm' ? theme.colors.primary : theme.colors.textFaint;

  function openDirections(m: Mosque) {
    // Google Maps universal link — opens the Google Maps app if installed (both
    // iOS and Android), otherwise Google Maps in the browser.
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`
    ).catch(() => {});
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? mosques.filter((m) => (m.name + ' ' + m.area).toLowerCase().includes(q))
      : mosques;
    return [...list].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [query, mosques]);

  return (
    <Screen scroll title={t('mosques.title')} subtitle={t('mosques.subtitle')}>
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

      {!loading && results.length === 0 ? (
        <Card alt style={styles.empty}>
          <Ionicons name="location-outline" size={28} color={theme.colors.textMuted} />
          <Text variant="bodyMedium" align="center" style={{ marginTop: 10 }}>
            {t('mosques.emptyTitle')}
          </Text>
          <Text variant="caption" color="textMuted" align="center" style={{ marginTop: 6, maxWidth: 280 }}>
            {t('mosques.emptyBody')}
          </Text>
          <Pressable onPress={() => setReloadKey((k) => k + 1)} style={[styles.retry, { borderColor: theme.colors.primary }]}>
            <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            <Text variant="caption" color="primary" style={{ marginLeft: 6 }}>
              {t('mosques.retry')}
            </Text>
          </Pressable>
        </Card>
      ) : null}

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

            <Pressable
              onPress={() => openDirections(m)}
              style={[styles.dirBtn, { backgroundColor: theme.colors.primaryContainer }]}
            >
              <Ionicons name="navigate" size={15} color={theme.colors.onPrimaryContainer} />
              <Text variant="caption" style={{ marginLeft: 6, color: theme.colors.onPrimaryContainer }}>
                {t('mosques.directions')}
              </Text>
            </Pressable>
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
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sourceTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  sourceDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  distance: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  facilityIcons: { flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 28 },
  retry: { flexDirection: 'row', alignItems: 'center', marginTop: 14, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  dirBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
