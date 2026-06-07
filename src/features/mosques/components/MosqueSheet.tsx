import React from 'react';
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, IconButton, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { FACILITIES, Mosque } from '../types';

type Props = {
  mosque: Mosque | null;
  onClose: () => void;
  /** Optional backend report hook; falls back to a local acknowledgement. */
  onReport?: (id: string) => void | Promise<unknown>;
};

const JAMAAH_ORDER: { key: keyof Mosque['jamaah']; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Magh' },
  { key: 'isha', label: 'Isha' },
];

export function MosqueSheet({ mosque, onClose, onReport }: Props) {
  const theme = useTheme();
  const t = useT();

  function directions() {
    if (!mosque) return;
    const { latitude, longitude, name } = mosque;
    const label = encodeURIComponent(name);
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`)
    );
  }

  return (
    <Modal visible={mosque !== null} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={onClose} />
      <View style={styles.wrap}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            },
          ]}
        >
          <View style={styles.grabber} />
          {mosque ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              {/* Header */}
              <View style={styles.header}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View style={styles.titleRow}>
                    <Text variant="heading">{mosque.name}</Text>
                    {mosque.verified ? (
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                    ) : null}
                  </View>
                  <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                    {mosque.distanceKm} km · {mosque.area}
                  </Text>
                </View>
                <Pressable
                  onPress={directions}
                  style={[styles.directions, { backgroundColor: theme.colors.primary }]}
                  accessibilityLabel="Directions"
                >
                  <Ionicons name="navigate" size={22} color={theme.colors.onPrimary} />
                </Pressable>
              </View>

              {/* Jamaah times */}
              <View style={styles.sectionRow}>
                <Text variant="label" color="textMuted">
                  {t('mosques.jamaah')}
                </Text>
                <Text variant="caption" color="textFaint">
                  {t('mosques.updated', { time: mosque.updated })}
                </Text>
              </View>
              <View style={styles.times}>
                {JAMAAH_ORDER.map((j) => (
                  <View
                    key={j.key}
                    style={[styles.timeCell, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
                  >
                    <Text variant="caption" color="textFaint">
                      {j.label}
                    </Text>
                    <Text variant="bodyMedium" color="primary" style={{ marginTop: 2 }}>
                      {mosque.jamaah[j.key]}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Jumu'ah */}
              <Card alt style={styles.jumuah}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                    {t('mosques.jumuah', { time: mosque.jamaah.jumuah })}
                  </Text>
                </View>
                <Text variant="caption" color="textMuted">
                  {mosque.jumuahLanguage}
                </Text>
              </Card>

              {/* Facilities */}
              <Text variant="label" color="textMuted" style={{ marginTop: 18, marginBottom: 10 }}>
                {t('mosques.facilities')}
              </Text>
              <View style={styles.facilities}>
                {mosque.facilities.map((f) => {
                  const meta = FACILITIES[f];
                  return (
                    <View
                      key={f}
                      style={[styles.facility, { backgroundColor: theme.colors.surfaceContainer, borderColor: theme.colors.border }]}
                    >
                      <Ionicons name={meta.icon} size={16} color={theme.colors.primary} />
                      <Text variant="caption" color="text" style={{ marginLeft: 8 }}>
                        {meta.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.footerActions}>
                <Pressable
                  style={styles.footerBtn}
                  onPress={() => Alert.alert('Suggest an edit', 'Community editing arrives with accounts in the next update.')}
                >
                  <Ionicons name="create-outline" size={18} color={theme.colors.textMuted} />
                  <Text variant="caption" color="textMuted" style={{ marginLeft: 8 }}>
                    {t('mosques.suggestEdit')}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.footerBtn}
                  onPress={() => {
                    onReport?.(mosque.id);
                    Alert.alert('Report listing', 'Thank you — we’ll review this listing.');
                  }}
                >
                  <Ionicons name="flag-outline" size={18} color={theme.colors.textMuted} />
                  <Text variant="caption" color="textMuted" style={{ marginLeft: 8 }}>
                    {t('mosques.reportListing')}
                  </Text>
                </Pressable>
              </View>

              <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 14 }}>
                Map data © OpenStreetMap contributors · listing not yet community-verified for all
                fields.
              </Text>
            </ScrollView>
          ) : null}
          <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} style={styles.close} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 28 },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.4)',
    marginBottom: 8,
  },
  close: { position: 'absolute', right: 14, top: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  directions: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  times: { flexDirection: 'row', gap: 7 },
  timeCell: { flex: 1, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingVertical: 10 },
  jumuah: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  facilities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facility: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  footerActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
