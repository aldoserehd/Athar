import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Logo, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import {
  COLLECTIONS,
  CollectionKey,
  HADITHS,
  Hadith,
  HadithCard,
  hadithOfTheDay,
  loadLibrary,
  searchHadiths,
  TOPICS,
  useSavedHadiths,
} from '@/features/hadith';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HadithScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation<Nav>();
  const { saved } = useSavedHadiths();

  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState<CollectionKey | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [library, setLibrary] = useState<Hadith[]>(HADITHS);
  const [loading, setLoading] = useState(true);

  // Lazily load the full bundled corpus (thousands of narrations).
  useEffect(() => {
    let active = true;
    loadLibrary()
      .then((lib) => active && setLibrary(lib))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(
    () => searchHadiths(query, { collection, topic, library, limit: 60 }),
    [query, collection, topic, library]
  );

  const savedList = useMemo(
    () => saved.map((id) => library.find((h) => h.id === id)).filter((h): h is Hadith => !!h),
    [saved, library]
  );

  const browsing = !query.trim() && !collection && !topic && !savedOnly;
  const open = (id: string) => navigation.navigate('HadithDetail', { id });

  const dailyHadith = useMemo(() => hadithOfTheDay(), []);

  return (
    <Screen
      scroll
      title={t('hadith.title')}
      subtitle={t('hadith.subtitle')}
      headerRight={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={() => navigation.navigate('HadithScan')}
            accessibilityLabel="Scan a hadith"
            hitSlop={8}
          >
            <Ionicons name="scan-outline" size={22} color={theme.colors.primary} />
          </Pressable>
          <Logo size={28} />
        </View>
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
          onChangeText={(v) => {
            setQuery(v);
            setSavedOnly(false);
          }}
          placeholder={t('hadith.searchPlaceholder')}
          placeholderTextColor={theme.colors.textFaint}
          style={[styles.input, { color: theme.colors.text, fontFamily: theme.fonts.regular }]}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {/* Chips: Saved + collections */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={{ marginHorizontal: -theme.spacing.xl, paddingHorizontal: theme.spacing.xl }}
      >
        <Chip
          label={`☆ ${t('hadith.saved')}${savedList.length ? ` ${savedList.length}` : ''}`}
          active={savedOnly}
          onPress={() => {
            setSavedOnly((v) => !v);
            setQuery('');
            setCollection(null);
            setTopic(null);
          }}
        />
        <Chip label="All" active={!collection && !savedOnly} onPress={() => { setCollection(null); setSavedOnly(false); }} />
        {COLLECTIONS.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            active={collection === c.key}
            onPress={() => {
              setCollection(collection === c.key ? null : c.key);
              setSavedOnly(false);
            }}
          />
        ))}
      </ScrollView>

      {savedOnly ? (
        savedList.length === 0 ? (
          <EmptyNote icon="bookmark-outline" text={t('hadith.savedEmpty')} />
        ) : (
          savedList.map((h) => <HadithCard key={h.id} hadith={h} onPress={() => open(h.id)} />)
        )
      ) : browsing ? (
        <>
          <Text variant="label" color="textMuted" style={styles.sectionLabel}>
            {t('hadith.topics')}
          </Text>
          <View style={styles.topics}>
            {TOPICS.map((tp) => (
              <Pressable key={tp} onPress={() => setTopic(tp)} style={styles.topicWrap}>
                <Card alt style={styles.topic}>
                  <Text variant="bodyMedium">{tp}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
          <Text variant="label" color="textMuted" style={styles.sectionLabel}>
            {t('hadith.hadithOfDay')}
          </Text>
          <HadithCard hadith={dailyHadith} onPress={() => open(dailyHadith.id)} />
        </>
      ) : (
        <>
          <View style={styles.resultsHead}>
            <Text variant="label" color="textMuted">
              {results.length}
              {results.length >= 60 ? '+' : ''} {t('hadith.results')}
            </Text>
            {topic ? (
              <Pressable onPress={() => setTopic(null)} hitSlop={8}>
                <Text variant="caption" color="primary">
                  {topic} ✕
                </Text>
              </Pressable>
            ) : null}
          </View>
          {results.length === 0 ? (
            <EmptyNote icon="search-outline" text={t('hadith.noResults')} />
          ) : (
            results.map((h) => <HadithCard key={h.id} hadith={h} onPress={() => open(h.id)} />)
          )}
        </>
      )}

      <View style={styles.footer}>
        {loading ? <ActivityIndicator size="small" color={theme.colors.textFaint} /> : null}
        <Text variant="caption" color="textFaint" align="center" style={{ marginTop: loading ? 8 : 0 }}>
          {loading
            ? t('hadith.loading')
            : t('hadith.libraryNote', { count: library.length.toLocaleString() })}
        </Text>
      </View>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text variant="label" style={{ color: active ? theme.colors.onPrimary : theme.colors.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyNote({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Ionicons name={icon} size={28} color={theme.colors.textFaint} />
      <Text variant="body" color="textMuted" align="center" style={{ marginTop: 10, maxWidth: 280 }}>
        {text}
      </Text>
    </Card>
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
  },
  input: { flex: 1, fontSize: 16, padding: 0 },
  chips: { gap: 8, paddingVertical: 16 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 6, marginBottom: 12 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  topicWrap: { width: '47.8%' },
  topic: { paddingVertical: 18, alignItems: 'flex-start' },
  resultsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  footer: { marginTop: 14, alignItems: 'center' },
});
