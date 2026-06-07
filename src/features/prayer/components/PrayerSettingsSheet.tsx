import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { IconButton, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { usePrayer } from '../PrayerContext';
import { METHODS } from '../methods';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Opens the adhān & athkār notification settings. */
  onOpenNotifications?: () => void;
};

export function PrayerSettingsSheet({ visible, onClose, onOpenNotifications }: Props) {
  const theme = useTheme();
  const { settings, setMethod, setHour12 } = usePrayer();
  const t = useT();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
        onPress={onClose}
      />
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
          <View style={styles.header}>
            <Text variant="heading">{t('settings.prayerSettings')}</Text>
            <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} />
          </View>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            {/* Adhān & notifications — prominent entry */}
            {onOpenNotifications ? (
              <Pressable
                onPress={onOpenNotifications}
                style={[
                  styles.adhanRow,
                  { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.md },
                ]}
              >
                <Ionicons name="notifications" size={22} color={theme.colors.onPrimaryContainer} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    {t('notifications.adhanReminders')}
                  </Text>
                  <Text variant="caption" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.8, marginTop: 1 }}>
                    {t('notifications.dailyAthkar')} · {t('notifications.adhanDesc')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.onPrimaryContainer} />
              </Pressable>
            ) : null}

            {/* Time format */}
            <Text variant="caption" color="textMuted" style={[styles.section, { marginTop: 16 }]}>
              {t('settings.timeFormat')}
            </Text>
            <View style={[styles.segment, { backgroundColor: theme.colors.surfaceContainer }]}>
              {[true, false].map((is12) => {
                const active = settings.hour12 === is12;
                return (
                  <Pressable
                    key={String(is12)}
                    onPress={() => setHour12(is12)}
                    style={[
                      styles.segmentItem,
                      active && {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.sm,
                      },
                    ]}
                  >
                    <Text variant="label" color={active ? 'text' : 'textMuted'}>
                      {is12 ? t('settings.h12') : t('settings.h24')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Calculation method */}
            <Text variant="caption" color="textMuted" style={styles.section}>
              {t('settings.calcMethod')}
            </Text>
            <View
              style={[
                styles.list,
                { borderColor: theme.colors.border, borderRadius: theme.radius.lg },
              ]}
            >
              {METHODS.map((m, i) => {
                const active = settings.method === m.key;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setMethod(m.key)}
                    style={[
                      styles.row,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{m.label}</Text>
                      <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                        {m.region}
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                    ) : (
                      <View
                        style={[styles.radio, { borderColor: theme.colors.border }]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 32 },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.4)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adhanRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 8 },
  section: { letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 12 },
  segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  list: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
});
