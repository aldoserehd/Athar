import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Witr (الوتر) — the emphasised Sunnah night prayer prayed after ʿIshāʾ and
 * before Fajr, in an odd number of rakʿahs (1, 3, 5…). It is *not* obligatory,
 * so it is kept entirely separate from the fard prayer tracker and its make-up
 * accounting — Witr is voluntary and never owed as qaḍāʾ.
 */

export const DUA_QUNUT = {
  arabic:
    'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، إِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
  translation:
    'O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your care among those You have taken into Your care, bless for me what You have given, and protect me from the evil You have decreed. For You decree and none can decree over You; none You befriend is humiliated, and none You oppose is honoured. Blessed and Exalted are You, our Lord.',
  reference: 'Abu Dawud · Tirmidhi · an-Nasa’i',
};

/** Brief, practical guidance on how and when Witr is prayed. */
export const WITR_GUIDE: { en: string; ar: string }[] = [
  {
    en: 'Witr is prayed after the ʿIshāʾ prayer and lasts until the break of Fajr.',
    ar: 'يُصلَّى الوتر بعد صلاة العشاء ويمتد وقته حتى طلوع الفجر.',
  },
  {
    en: 'It is an odd number of rakʿahs — most commonly one, or three. The minimum is a single rakʿah.',
    ar: 'هو ركعات وترية (فردية) — غالبًا ركعة واحدة أو ثلاث، وأقلّه ركعة واحدة.',
  },
  {
    en: 'It is the most emphasised of the voluntary night prayers; the Prophet ﷺ never left it, in residence or travel.',
    ar: 'هو آكد صلوات التطوع في الليل، ولم يكن النبي ﷺ يتركه حضرًا ولا سفرًا.',
  },
  {
    en: 'Duʿāʾ al-Qunūt may be recited in the last rakʿah, raising the hands in supplication.',
    ar: 'يُستحب قنوت الوتر في الركعة الأخيرة، رافعًا يديه بالدعاء.',
  },
  {
    en: 'If you fear not waking, pray Witr before sleeping; whoever wishes may delay it to the last third of the night.',
    ar: 'من خاف ألا يقوم آخر الليل فليوتر أوله، ومن طمع أن يقوم آخره فالوتر آخر الليل أفضل.',
  },
];

const STORAGE_KEY = 'athar.witr.v1';

type WitrState = {
  enabled: boolean;
  /** Local YYYY-MM-DD of the last day Witr was marked prayed. */
  lastPrayed: string | null;
};

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useWitr() {
  const [state, setState] = useState<WitrState>({ enabled: false, lastPrayed: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active && raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as Partial<WitrState>) }));
      })
      .catch(() => {})
      .finally(() => active && setHydrated(true));
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: WitrState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const prayedToday = state.lastPrayed === todayKey();

  const setEnabled = useCallback(
    (enabled: boolean) => persist({ ...state, enabled }),
    [persist, state]
  );

  const togglePrayed = useCallback(() => {
    persist({ ...state, lastPrayed: prayedToday ? null : todayKey() });
  }, [persist, state, prayedToday]);

  return { enabled: state.enabled, prayedToday, hydrated, setEnabled, togglePrayed };
}
