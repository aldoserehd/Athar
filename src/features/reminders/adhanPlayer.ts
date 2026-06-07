import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { adhanSource } from './reciters';

async function enableAudio() {
  // Play even when the ringer is on silent (adhān should be heard).
  await setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

/** Fire-and-forget full-adhān playback (used when a prayer fires in foreground). */
export function playAdhanOnce(reciterId: string): void {
  (async () => {
    await enableAudio();
    const player = createAudioPlayer(adhanSource(reciterId));
    player.play();
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      if (s.didJustFinish) {
        sub?.remove?.();
        player.remove();
      }
    });
  })();
}

/** Hook for the settings preview: tap a reciter to play/stop their adhān. */
export function useAdhanPreview() {
  const ref = useRef<AudioPlayer | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const release = () => {
    if (ref.current) {
      try {
        ref.current.pause();
      } catch {
        /* already stopped */
      }
      ref.current.remove();
      ref.current = null;
    }
  };

  const stop = useCallback(() => {
    release();
    setPlaying(null);
  }, []);

  const toggle = useCallback(
    async (id: string) => {
      if (playing === id) {
        stop();
        return;
      }
      // Always stop whatever is currently playing before starting another.
      release();
      await enableAudio();
      const player = createAudioPlayer(adhanSource(id));
      player.play();
      ref.current = player;
      setPlaying(id);
      player.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish) setPlaying((cur) => (cur === id ? null : cur));
      });
    },
    [playing, stop]
  );

  useEffect(() => () => ref.current?.remove(), []);

  return { playing, toggle, stop };
}
