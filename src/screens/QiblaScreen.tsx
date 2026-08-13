import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import {
  angleDelta,
  CompassRose,
  FixedPointer,
  qiblaFor,
  useHeading,
  usePrayer,
} from '@/features/prayer';

const ALIGN_THRESHOLD = 4; // degrees

export function QiblaScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation();
  const { place } = usePrayer();
  const { heading, available, needsCalibration } = useHeading();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('qibla.title') });
  }, [navigation, t]);

  const qibla = useMemo(
    () => (place ? qiblaFor(place.latitude, place.longitude) : 0),
    [place],
  );
  const size = Math.min(Dimensions.get('window').width - 56, 340);

  const delta = heading == null ? 0 : angleDelta(heading, qibla); // + = turn right
  const aligned = place != null && heading != null && Math.abs(delta) <= ALIGN_THRESHOLD;

  // Haptic pulse the moment we lock on.
  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    wasAligned.current = aligned;
  }, [aligned]);

  if (!place) {
    return (
      <Screen scroll edges={['left', 'right']}>
        <Card alt style={styles.status}>
          <Ionicons name="location-outline" size={22} color={theme.colors.primary} />
          <Text variant="body" color="textMuted" style={styles.statusText}>
            {t('qibla.locationRequired')}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Text variant="label" color="textMuted" style={{ marginTop: 4 }}>
        {place.city}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 6, marginBottom: 8 }}>
        {t('qibla.instruction')}
      </Text>

      <View style={styles.stage}>
        <FixedPointer size={size} color={aligned ? theme.colors.success : theme.colors.primary} />
        <View
          style={{
            transform: [{ rotate: `${heading == null ? 0 : -heading}deg` }],
          }}
        >
          <CompassRose size={size} qibla={qibla} aligned={aligned} />
        </View>

        {/* center readout overlay */}
        <View style={styles.readout} pointerEvents="none">
          <Text variant="display" color={aligned ? 'success' : 'text'}>
            {Math.round(qibla)}°
          </Text>
          <Text variant="caption" color="textMuted">
            {t('qibla.qiblaFromN')}
          </Text>
        </View>
      </View>

      {/* status */}
      {!available ? (
        <Card alt style={styles.status}>
          <Ionicons name="compass-outline" size={20} color={theme.colors.textMuted} />
          <Text variant="body" color="textMuted" style={styles.statusText}>
            {t('qibla.waiting')}
          </Text>
        </Card>
      ) : aligned ? (
        <Card style={[styles.status, { backgroundColor: theme.colors.primaryContainer }]}>
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
          <Text variant="bodyMedium" style={[styles.statusText, { color: theme.colors.onPrimaryContainer }]}>
            {t('qibla.facing')}
          </Text>
        </Card>
      ) : (
        <Card alt style={styles.status}>
          <Ionicons
            name={delta > 0 ? 'arrow-forward-circle' : 'arrow-back-circle'}
            size={22}
            color={theme.colors.primary}
          />
          <Text variant="bodyMedium" style={styles.statusText}>
            {delta > 0
              ? t('qibla.turnRight', { deg: Math.round(Math.abs(delta)) })
              : t('qibla.turnLeft', { deg: Math.round(Math.abs(delta)) })}
          </Text>
        </Card>
      )}

      {needsCalibration ? (
        <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 12 }}>
          {t('qibla.calibrate')}
        </Text>
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 16 }}>
        {t('qibla.bearingNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 24,
  },
  readout: { position: 'absolute', alignItems: 'center', top: '50%', marginTop: -28 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: { flex: 1, marginStart: 12 },
});
