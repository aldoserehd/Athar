import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import {
  manualPlaceFromResult,
  searchManualPlaces,
  type ManualPlaceResult,
  usePrayer,
} from '@/features/prayer';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';

export function LocationSetupScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { language, isRTL, t } = useLanguage();
  const {
    place,
    locationStatus,
    canAskAgain,
    loading,
    refreshLocation,
    setManualPlace,
  } = usePrayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ManualPlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('locationSetup.title') });
  }, [navigation, t]);

  const handlePermissionAction = () => {
    if (locationStatus === 'needsPermission' && !canAskAgain) {
      void Linking.openSettings();
      return;
    }
    void refreshLocation();
  };

  const submitSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const next = await searchManualPlaces(query, language);
      setResults(next);
      if (next.length === 0) setError(t('locationSetup.noResults'));
    } catch {
      setResults([]);
      setError(t('locationSetup.searchError'));
    } finally {
      setSearching(false);
    }
  };

  const selectResult = async (result: ManualPlaceResult) => {
    setSelectingId(result.id);
    setError(null);
    try {
      await setManualPlace(manualPlaceFromResult(result));
      navigation.goBack();
    } catch {
      setError(t('locationSetup.saveError'));
      setSelectingId(null);
    }
  };

  const permissionButtonLabel =
    locationStatus === 'needsPermission' && !canAskAgain
      ? t('locationSetup.openSettings')
      : t('locationSetup.tryAgain');

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={styles.content}>
      <Card style={styles.statusCard}>
        <View style={[styles.statusIcon, { backgroundColor: theme.colors.primaryContainer }]}>
          <Ionicons
            name={place ? 'checkmark-circle-outline' : 'location-outline'}
            size={28}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="heading" align="center" style={styles.statusTitle}>
          {place ? t('locationSetup.currentTitle') : t('locationSetup.permissionTitle')}
        </Text>
        {place ? (
          <>
            <Text variant="bodyMedium" align="center" style={styles.placeName}>
              {place.city}
            </Text>
            <Text variant="caption" color="textMuted" align="center">
              {t('locationSetup.localTimezone')}
            </Text>
          </>
        ) : (
          <Text variant="body" color="textMuted" align="center" style={styles.description}>
            {t('locationSetup.permissionDesc')}
          </Text>
        )}
        <Button
          fullWidth
          loading={loading}
          label={place ? t('locationSetup.useCurrent') : permissionButtonLabel}
          icon="locate-outline"
          onPress={handlePermissionAction}
          style={styles.primaryButton}
        />
      </Card>

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Text variant="caption" color="textFaint" style={styles.orLabel}>
          {t('locationSetup.or')}
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      </View>

      <Text variant="heading">{t('locationSetup.manualTitle')}</Text>
      <Text variant="body" color="textMuted" style={styles.manualDescription}>
        {t('locationSetup.manualDesc')}
      </Text>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Ionicons name="search-outline" size={19} color={theme.colors.textFaint} />
          <TextInput
            accessibilityLabel={t('locationSetup.searchPlaceholder')}
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={() => void submitSearch()}
            placeholder={t('locationSetup.searchPlaceholder')}
            placeholderTextColor={theme.colors.textFaint}
            returnKeyType="search"
            style={[
              styles.input,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts.regular,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            value={query}
          />
        </View>
        <Button
          label={t('locationSetup.search')}
          loading={searching}
          disabled={!query.trim()}
          onPress={() => void submitSearch()}
        />
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      {results.map((result) => (
        <Pressable
          accessibilityRole="button"
          disabled={selectingId !== null}
          key={result.id}
          onPress={() => void selectResult(result)}
          style={({ pressed }) => [
            styles.result,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: pressed || selectingId === result.id ? 0.65 : 1,
            },
          ]}
        >
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text variant="body" style={styles.resultLabel}>
            {result.label}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
        </Pressable>
      ))}

      <Text variant="caption" color="textFaint" align="center" style={styles.attribution}>
        {t('locationSetup.attribution')}
      </Text>
      <Text variant="caption" color="textFaint" align="center" style={styles.privacy}>
        {t('locationSetup.privacy')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16 },
  statusCard: { alignItems: 'center', paddingVertical: 26 },
  statusIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { marginTop: 14 },
  placeName: { marginTop: 10 },
  description: { marginTop: 8, maxWidth: 310 },
  primaryButton: { marginTop: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  orLabel: { marginHorizontal: 12 },
  manualDescription: { marginTop: 6, marginBottom: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12 },
  input: { flex: 1, fontSize: 15, paddingHorizontal: 8, paddingVertical: 12 },
  errorText: { marginTop: 10 },
  result: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, padding: 14, marginTop: 10 },
  resultLabel: { flex: 1, marginHorizontal: 10 },
  attribution: { marginTop: 22 },
  privacy: { marginTop: 6, marginBottom: 10 },
});
