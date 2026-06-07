import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'athar.hadith.saved.v1';

type SavedContextValue = {
  /** Saved hadith ids, most-recently-saved first. */
  saved: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const SavedContext = createContext<SavedContextValue | undefined>(undefined);

export function SavedHadithProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSaved(JSON.parse(raw) as string[]);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [saved, hydrated]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const value = useMemo(() => ({ saved, isSaved, toggle }), [saved, isSaved, toggle]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedHadiths(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSavedHadiths must be used within a SavedHadithProvider');
  return ctx;
}
