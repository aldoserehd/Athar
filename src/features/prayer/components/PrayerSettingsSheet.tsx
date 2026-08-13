import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton, Text } from '@/components';
import { useT } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { usePrayer } from '../PrayerContext';
import { METHODS, type PrayerAdjustmentKey } from '../methods';

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
};

const ADJUSTMENT_KEYS: PrayerAdjustmentKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export function PrayerSettingsSheet({ visible, onClose, onOpenNotifications }: Props) {
  const theme = useTheme();
  const {
    place,
    settings,
    resolvedMethod,
    setMethod,
    setMethodMode,
    setMadhab,
    setAdjustment,
    setHour12,
  } = usePrayer();
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
            <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {place ? (
              <View
                style={[
                  styles.locationCard,
                  {
                    backgroundColor: theme.colors.surfaceContainer,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                <View style={styles.flexText}>
                  <Text variant="bodyMedium">{place.city}</Text>
                  <Text variant="caption" color="textMuted" style={styles.subline}>
                    {t('locationSetup.localTimezone')}
                  </Text>
                </View>
              </View>
            ) : null}

            {onOpenNotifications ? (
              <Pressable
                accessibilityRole="button"
                onPress={onOpenNotifications}
                style={[
                  styles.actionRow,
                  {
                    backgroundColor: theme.colors.primaryContainer,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Ionicons name="notifications-outline" size={22} color={theme.colors.onPrimaryContainer} />
                <View style={styles.flexText}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    {t('notifications.adhanReminders')}
                  </Text>
                  <Text
                    variant="caption"
                    style={[styles.subline, { color: theme.colors.onPrimaryContainer, opacity: 0.8 }]}
                  >
                    {t('notifications.adhanDesc')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.onPrimaryContainer} />
              </Pressable>
            ) : null}

            <SectionLabel>{t('settings.timeFormat')}</SectionLabel>
            <Segment
              options={[
                { key: '12', label: t('settings.h12') },
                { key: '24', label: t('settings.h24') },
              ]}
              selected={settings.hour12 ? '12' : '24'}
              onSelect={(key) => setHour12(key === '12')}
            />

            <SectionLabel>{t('settings.calcMethod')}</SectionLabel>
            <Segment
              options={[
                { key: 'automatic', label: t('settings.automatic') },
                { key: 'manual', label: t('settings.manual') },
              ]}
              selected={settings.methodMode}
              onSelect={(key) => setMethodMode(key as 'automatic' | 'manual')}
            />
            {settings.methodMode === 'automatic' && resolvedMethod ? (
              <Text variant="caption" color="textMuted" style={styles.helper}>
                {t('settings.automaticMethod', {
                  method: t(`settings.methods.${resolvedMethod}.label`),
                })}
              </Text>
            ) : null}

            {settings.methodMode === 'manual' ? (
              <View
                style={[
                  styles.list,
                  { borderColor: theme.colors.border, borderRadius: theme.radius.lg },
                ]}
              >
                {METHODS.map((method, index) => {
                  const active = resolvedMethod === method.key;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      key={method.key}
                      onPress={() => setMethod(method.key)}
                      style={[
                        styles.methodRow,
                        index > 0 && {
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.flexText}>
                        <Text variant="bodyMedium">
                          {t(`settings.methods.${method.key}.label`)}
                        </Text>
                        <Text variant="caption" color="textFaint" style={styles.subline}>
                          {t(`settings.methods.${method.key}.region`)}
                        </Text>
                      </View>
                      <Ionicons
                        name={active ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={active ? theme.colors.primary : theme.colors.border}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <SectionLabel>{t('settings.asrMethod')}</SectionLabel>
            <Segment
              options={[
                { key: 'standard', label: t('settings.standard') },
                { key: 'hanafi', label: t('settings.hanafi') },
              ]}
              selected={settings.madhab}
              onSelect={(key) => setMadhab(key as 'standard' | 'hanafi')}
            />

            <SectionLabel>{t('settings.adjustments')}</SectionLabel>
            <Text variant="caption" color="textMuted" style={styles.adjustmentIntro}>
              {t('settings.adjustmentsDesc')}
            </Text>
            <View
              style={[
                styles.list,
                { borderColor: theme.colors.border, borderRadius: theme.radius.lg },
              ]}
            >
              {ADJUSTMENT_KEYS.map((key, index) => {
                const minutes = settings.adjustments[key];
                return (
                  <View
                    key={key}
                    style={[
                      styles.adjustmentRow,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text variant="body">{t(`prayerNames.${key}`)}</Text>
                    <View style={styles.stepper}>
                      <IconButton
                        icon="remove"
                        accessibilityLabel={t('settings.decreaseAdjustment', {
                          prayer: t(`prayerNames.${key}`),
                        })}
                        onPress={() => setAdjustment(key, minutes - 1)}
                      />
                      <Text variant="label" align="center" style={styles.adjustmentValue}>
                        {minutes > 0 ? `+${minutes}` : String(minutes)}
                      </Text>
                      <IconButton
                        icon="add"
                        accessibilityLabel={t('settings.increaseAdjustment', {
                          prayer: t(`prayerNames.${key}`),
                        })}
                        onPress={() => setAdjustment(key, minutes + 1)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="caption" color="textMuted" style={styles.section}>
      {children}
    </Text>
  );
}

function Segment({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: theme.colors.surfaceContainer }]}>
      {options.map((option) => {
        const active = selected === option.key;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[
              styles.segmentItem,
              active && { backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm },
            ]}
          >
            <Text variant="label" color={active ? 'text' : 'textMuted'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, maxHeight: '90%' },
  scroll: { maxHeight: 650 },
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
  locationCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 10 },
  flexText: { flex: 1, marginHorizontal: 12 },
  subline: { marginTop: 2 },
  section: { letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 12 },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  helper: { marginTop: 8 },
  list: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', marginTop: 10 },
  methodRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  adjustmentIntro: { marginBottom: 8 },
  adjustmentRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingStart: 14,
    paddingEnd: 6,
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  adjustmentValue: { minWidth: 38 },
});
