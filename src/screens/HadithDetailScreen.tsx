import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import {
  GradePill,
  Hadith,
  hadithById,
  findInLibrary,
  loadLibrary,
  referenceArabic,
  useSavedHadiths,
} from '@/features/hadith';

type DetailRoute = RouteProp<RootStackParamList, 'HadithDetail'>;

export function HadithDetailScreen() {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const { id } = route.params;
  const { isSaved, toggle } = useSavedHadiths();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('hadith.title') });
  }, [navigation, t]);

  const [hadith, setHadith] = useState<Hadith | undefined>(() => hadithById(id) ?? findInLibrary(id));
  const [chainOpen, setChainOpen] = useState(false);

  // Resolve from the full library in case it's a bulk-corpus narration.
  useEffect(() => {
    if (hadith) return;
    let active = true;
    loadLibrary().then((lib) => {
      if (active) setHadith(lib.find((h) => h.id === id));
    });
    return () => {
      active = false;
    };
  }, [id, hadith]);

  if (!hadith) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  const saved = isSaved(hadith.id);
  const share = () => {
    const message = isAr
      ? `${hadith.arabic}\n— ${referenceArabic(hadith)}`
      : `${hadith.arabic}\n\n“${hadith.english}”\n— ${hadith.reference}`;
    Share.share({ message }).catch(() => {});
  };

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingBottom: 110 }}>
      <Text
        style={{
          fontFamily: theme.fonts.arabic,
          fontSize: 28,
          lineHeight: 52,
          includeFontPadding: false,
          color: theme.colors.text,
          textAlign: 'right',
          marginTop: 8,
        }}
      >
        {hadith.arabic}
      </Text>

      {!isAr ? (
        <Text variant="body" color="textMuted" style={styles.translation}>
          “{hadith.english}”
        </Text>
      ) : null}

      {/* Source + grade */}
      <Card style={styles.sourceRow}>
        <View style={styles.sourceLeft}>
          <View style={[styles.sourceIcon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons name="book" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="caption" color="textFaint">
              {t('hadith.source')}
            </Text>
            <Text variant="bodyMedium" color="primary">
              {isAr ? referenceArabic(hadith) : hadith.reference}
            </Text>
          </View>
        </View>
        <GradePill grade={hadith.grade} arabic={isAr} />
      </Card>

      {hadith.narrator ? (
        <Card style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={22} color={theme.colors.textMuted} />
          <Text variant="body" style={{ marginLeft: 10 }}>
            {t('hadith.narratedBy', { name: (isAr && hadith.narratorAr) || hadith.narrator })}
          </Text>
        </Card>
      ) : null}

      {/* Explanation */}
      <Text variant="label" color="textMuted" style={styles.sectionLabel}>
        {t('hadith.explanation')}
      </Text>
      <Card>
        {(() => {
          const explanation = (isAr && hadith.explanationAr) || hadith.explanation;
          return (
            <Text variant="body" color={explanation ? 'text' : 'textMuted'} style={{ lineHeight: 24 }}>
              {explanation ?? t('hadith.noExplanation')}
            </Text>
          );
        })()}
      </Card>

      {/* Chain (collapsible) — curated entries only */}
      {hadith.chain && hadith.chain.length > 0 ? (
        <>
          <Pressable onPress={() => setChainOpen((v) => !v)} style={{ marginTop: 16 }}>
            <Card style={styles.chainHead}>
              <View style={styles.sourceLeft}>
                <Ionicons name="git-branch-outline" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                  {t('hadith.chain')}
                </Text>
              </View>
              <Ionicons name={chainOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textFaint} />
            </Card>
          </Pressable>
          {chainOpen ? (
            <Card alt style={{ marginTop: 8 }}>
              {((isAr && hadith.chainAr && hadith.chainAr.length === hadith.chain.length
                ? hadith.chainAr
                : hadith.chain) as string[]).map((name, i) => (
                <View key={name + i} style={styles.chainRow}>
                  <View style={[styles.chainDot, { borderColor: theme.colors.primary }]}>
                    <Text variant="caption" color="primary">
                      {i + 1}
                    </Text>
                  </View>
                  <Text variant="body" style={{ marginLeft: 12 }}>
                    {name}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}

      {/* Topics */}
      {hadith.topics.length > 0 ? (
        <View style={styles.topics}>
          {hadith.topics.map((tp) => (
            <View key={tp} style={[styles.topicTag, { backgroundColor: theme.colors.surfaceContainer }]}>
              <Text variant="caption" color="textMuted">
                {(() => {
                  const v = t(`hadithTopics.${tp.toLowerCase()}`);
                  return v.startsWith('[missing') ? tp : v;
                })()}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Actions */}
      <View style={[styles.actions, { borderColor: theme.colors.border }]}>
        <Action icon="share-outline" label={t('hadith.share')} onPress={share} />
        <Action
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          label={saved ? t('hadith.savedAction') : t('hadith.saveAction')}
          active={saved}
          onPress={() => toggle(hadith.id)}
        />
        <Action
          icon="flag-outline"
          label={t('hadith.report')}
          onPress={() => Alert.alert(t('hadith.reportTitle'), t('hadith.reportBody'))}
        />
      </View>
    </Screen>
  );
}

function Action({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.action} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={active ? theme.colors.primary : theme.colors.textMuted} />
      <Text variant="caption" color={active ? 'primary' : 'textMuted'} style={{ marginTop: 4 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  translation: { marginTop: 16, fontStyle: 'italic', lineHeight: 24 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  sourceLeft: { flexDirection: 'row', alignItems: 'center' },
  sourceIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionLabel: { letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  chainHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chainRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  chainDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  topicTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  action: { alignItems: 'center', paddingHorizontal: 16 },
});
