import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n/LanguageProvider';
import type { RootStackParamList } from '@/navigation/types';
import {
  Hadith,
  HadithCard,
  loadLibrary,
  matchHadith,
  OcrLang,
  recognizeText,
} from '@/features/hadith';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Phase = 'idle' | 'reading' | 'done' | 'error';

export function ScanScreen() {
  const theme = useTheme();
  const t = useT();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('scan.title') });
  }, [navigation, t]);

  const [lang, setLang] = useState<OcrLang>('ara');
  const [image, setImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [text, setText] = useState('');
  const [match, setMatch] = useState<Hadith | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');

  async function run(base64: string, uri: string) {
    setImage(uri);
    setPhase('reading');
    setMatch(null);
    setText('');
    try {
      const recognized = await recognizeText(base64, lang);
      setText(recognized);
      if (!recognized) {
        setPhase('error');
        setError(t('scan.errorNoText'));
        return;
      }
      const library = await loadLibrary();
      const best = matchHadith(recognized, library);
      if (best && best.score >= 0.25) {
        setMatch(best.hadith);
        setConfidence(best.score);
      }
      setPhase('done');
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : t('scan.errorGeneric'));
    }
  }

  async function pick(source: 'camera' | 'library') {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6, allowsEditing: true });
    if (!res.canceled && res.assets[0]?.base64) {
      run(res.assets[0].base64, res.assets[0].uri);
    }
  }

  return (
    <Screen scroll edges={['left', 'right']} contentStyle={{ paddingTop: 16 }}>
      <Text variant="body" color="textMuted" style={{ marginBottom: 14 }}>
        {t('scan.intro')}
      </Text>

      {/* Language */}
      <View style={[styles.segment, { backgroundColor: theme.colors.surfaceContainer }]}>
        {(['ara', 'eng'] as OcrLang[]).map((l) => {
          const active = lang === l;
          return (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={[styles.segmentItem, active && { backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm }]}
            >
              <Text variant="label" color={active ? 'text' : 'textMuted'}>
                {l === 'ara' ? t('scan.arabic') : t('scan.english')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {image ? (
        <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
      ) : (
        <Card alt style={styles.placeholder}>
          <Ionicons name="scan-outline" size={40} color={theme.colors.textFaint} />
          <Text variant="caption" color="textFaint" style={{ marginTop: 8 }}>
            {t('scan.noImage')}
          </Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button label={t('scan.takePhoto')} icon="camera-outline" onPress={() => pick('camera')} fullWidth />
        <Button label={t('scan.chooseImage')} icon="image-outline" variant="secondary" onPress={() => pick('library')} fullWidth style={{ marginTop: 10 }} />
      </View>

      {phase === 'reading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
            {t('scan.reading')}
          </Text>
        </View>
      ) : null}

      {phase === 'error' ? (
        <Card alt style={styles.note}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.colors.danger} />
          <Text variant="caption" color="textMuted" style={{ flex: 1, marginStart: 10 }}>
            {error}
          </Text>
        </Card>
      ) : null}

      {phase === 'done' ? (
        match ? (
          <>
            <Text variant="label" color="textMuted" style={styles.section}>
              {t('scan.bestMatch')} · {Math.round(confidence * 100)}% {t('scan.confidence')}
            </Text>
            <HadithCard hadith={match} onPress={() => navigation.navigate('HadithDetail', { id: match.id })} />
          </>
        ) : (
          <Card alt style={styles.note}>
            <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted" style={{ flex: 1, marginStart: 10 }}>
              {t('scan.noMatch')} “{text.slice(0, 80)}…”
            </Text>
          </Card>
        )
      ) : null}

      <Text variant="caption" color="textFaint" align="center" style={{ marginTop: 20 }}>
        {t('scan.ocrNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 16 },
  segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  preview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  placeholder: { height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  actions: { marginBottom: 8 },
  center: { alignItems: 'center', marginTop: 20 },
  note: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  section: { letterSpacing: 0.5, marginTop: 20, marginBottom: 12 },
});
