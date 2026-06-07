import { HADITHS } from './data';
import { CollectionKey, Hadith } from './types';

/**
 * Concept expansion — a lightweight stand-in for semantic search. Each entry
 * maps related words a user might type to canonical concepts/topics in the
 * data, so "rage" finds Anger, "ablution" finds Purity, etc.
 */
const CONCEPTS: Record<string, string[]> = {
  intention: ['intentions', 'niyyah', 'sincere', 'sincerity'],
  intentions: ['intention', 'niyyah', 'sincerity'],
  niyyah: ['intentions', 'sincerity'],
  sincerity: ['sincere', 'naseehah', 'intentions', 'honesty'],
  anger: ['angry', 'rage', 'temper', 'patience'],
  angry: ['anger', 'rage', 'temper'],
  rage: ['anger', 'temper'],
  patience: ['patient', 'perseverance', 'steadfast', 'sabr'],
  neighbour: ['neighbours', 'neighbor', 'neighbors'],
  neighbor: ['neighbours', 'neighbours'],
  kindness: ['kind', 'mercy', 'compassion', 'gentle', 'character'],
  mercy: ['merciful', 'compassion', 'kindness', 'rahma'],
  compassion: ['mercy', 'kindness'],
  charity: ['charitable', 'sadaqah', 'giving', 'generosity'],
  smile: ['smiling', 'charity', 'kindness'],
  knowledge: ['learn', 'learning', 'study', 'education', 'seek', 'ilm'],
  learn: ['knowledge', 'study', 'education'],
  study: ['knowledge', 'learning'],
  brotherhood: ['brother', 'community', 'unity', 'love'],
  character: ['manners', 'akhlaq', 'conduct', 'behaviour', 'behavior'],
  manners: ['character', 'akhlaq'],
  purity: ['pure', 'clean', 'cleanliness', 'ablution', 'wudu', 'tahara'],
  ablution: ['purity', 'wudu', 'clean'],
  wudu: ['purity', 'ablution'],
  prayer: ['salah', 'salat', 'worship', 'pray'],
  salah: ['prayer', 'worship'],
  worship: ['prayer', 'ibadah'],
  honesty: ['honest', 'truth', 'truthful', 'sidq', 'character'],
  truth: ['truthful', 'honesty'],
};

function expand(term: string): string[] {
  const out = new Set<string>([term]);
  (CONCEPTS[term] ?? []).forEach((t) => out.add(t));
  return [...out];
}

// Arabic in the data carries full diacritics (tashkil); users type without them.
// Strip ONLY the marks (these ranges never touch letters U+0621–U+064A) and
// unify alef / ya / waw-hamza / ta-marbuta, so a diacritic-free query matches.
// Written as \u escapes so no Arabic letter can be removed by accident.
const TASHKEEL =
  /[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(TASHKEEL, '')
    .replace(/[\u0623\u0625\u0622]/g, '\u0627') // hamza-alef -> bare alef
    .replace(/\u0649/g, '\u064A') // alef maqsura -> ya
    .replace(/\u0624/g, '\u0648') // waw-hamza -> waw
    .replace(/\u0626/g, '\u064A') // ya-hamza -> ya
    .replace(/\u0629/g, '\u0647'); // ta-marbuta -> ha
}

export type SearchOptions = {
  collection?: CollectionKey | null;
  topic?: string | null;
  /** The set to search; defaults to the curated entries. */
  library?: Hadith[];
  /** Max results to return (performance for large libraries). */
  limit?: number;
};

/**
 * Search the hadith library. Ranks by how strongly query terms (and their
 * related concepts) appear; exact term hits weigh more than concept hits.
 * Arabic-normalized so diacritic-free queries match.
 */
export function searchHadiths(query: string, options: SearchOptions = {}): Hadith[] {
  const { collection, topic, library = HADITHS, limit = 60 } = options;
  let pool = library;
  if (collection) pool = pool.filter((h) => h.collection === collection);
  if (topic) pool = pool.filter((h) => h.topics.includes(topic));

  const q = normalize(query.trim());
  if (!q) return pool.slice(0, limit);

  const terms = q.split(/\s+/).filter((t) => t.length > 1);
  if (terms.length === 0) return pool.slice(0, limit);

  const scored: { h: Hadith; score: number }[] = [];
  for (const h of pool) {
    const hay = normalize(
      [h.english, h.topics.join(' '), h.narrator ?? '', h.reference, h.arabic].join(' ')
    );
    let score = 0;
    for (const term of terms) {
      if (hay.includes(term)) score += 3;
      else if (expand(term).some((e) => hay.includes(e))) score += 1;
    }
    if (score > 0) scored.push({ h, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.h);
}
