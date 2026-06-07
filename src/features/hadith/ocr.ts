import { normalize } from './search';
import { Hadith } from './types';

/**
 * Recognise text from a photo of a hadith and match it to the library.
 *
 * On-device Arabic OCR isn't available in Expo, so this uses the free OCR.space
 * API (Arabic-capable). Set EXPO_PUBLIC_OCR_SPACE_KEY to your own free key; the
 * public demo key works for light testing but is heavily rate-limited.
 */
const OCR_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_KEY || 'helloworld';

export type OcrLang = 'ara' | 'eng';

export async function recognizeText(base64: string, lang: OcrLang): Promise<string> {
  const form = new FormData();
  form.append('apikey', OCR_KEY);
  form.append('language', lang);
  // Engine 1 supports Arabic; engine 2 is faster for Latin scripts.
  form.append('OCREngine', lang === 'ara' ? '1' : '2');
  form.append('isOverlayRequired', 'false');
  form.append('base64Image', `data:image/jpeg;base64,${base64}`);

  const res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form });
  const json: any = await res.json();
  if (json?.IsErroredOnProcessing) {
    throw new Error(Array.isArray(json.ErrorMessage) ? json.ErrorMessage[0] : 'OCR failed');
  }
  return (json?.ParsedResults?.[0]?.ParsedText ?? '').trim();
}

export type Match = { hadith: Hadith; score: number };

/**
 * Find the closest hadith by word overlap between the recognised text and each
 * narration's Arabic + English (both normalized). Returns the best match and a
 * 0..1 confidence; callers can reject low-confidence results.
 */
export function matchHadith(text: string, library: Hadith[]): Match | null {
  const tokens = [...new Set(normalize(text).split(/\s+/).filter((w) => w.length > 2))];
  if (tokens.length === 0) return null;

  let best: Match | null = null;
  for (const h of library) {
    const hay = normalize(`${h.arabic} ${h.english}`);
    let hits = 0;
    for (const tk of tokens) if (hay.includes(tk)) hits += 1;
    const score = hits / tokens.length;
    if (!best || score > best.score) best = { hadith: h, score };
  }
  return best;
}
