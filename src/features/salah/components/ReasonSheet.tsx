import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import { REASONS, ReasonKey } from '../reasons';

type Props = {
  visible: boolean;
  prayerLabel?: string;
  onClose: () => void;
  onPick: (reason: ReasonKey) => void;
};

export function ReasonSheet({ visible, prayerLabel, onClose, onPick }: Props) {
  const theme = useTheme();
  const t = useT();
  const title = prayerLabel
    ? t('salahReasons.title', { prayer: prayerLabel })
    : t('salahReasons.titleNoPrayer');
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="heading">{title}</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                {t('salahReasons.honest')}
              </Text>
            </View>
            <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {REASONS.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => {
                  onPick(r.key);
                  onClose();
                }}
                style={[
                  styles.row,
                  { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, borderRadius: theme.radius.md },
                ]}
              >
                <View style={styles.rowHead}>
                  <Text variant="bodyMedium">{t(`salahReasons.${r.key}`)}</Text>
                  <View style={styles.rowRight}>
                    <View
                      style={[
                        styles.tag,
                        {
                          backgroundColor: r.exempt
                            ? theme.colors.secondaryContainer
                            : theme.colors.surfaceContainerHigh,
                        },
                      ]}
                    >
                      <Text variant="caption" color={r.exempt ? 'onSecondaryContainer' : 'textMuted'}>
                        {r.exempt ? t('salahReasons.exempt') : t('salahReasons.makeup')}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text variant="caption" color="textFaint" style={{ marginTop: 4 }}>
                  {t(`salahReasons.${r.key}Note`)}
                </Text>
              </Pressable>
            ))}
            <Text variant="caption" color="textFaint" style={{ marginTop: 6, marginBottom: 4 }}>
              {t('salahReasons.disclaimer')}
            </Text>
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
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  row: { borderWidth: StyleSheet.hairlineWidth, padding: 14, marginBottom: 10 },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});
