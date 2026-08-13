import { translations } from './translations';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('supported translations', () => {
  it('keeps Arabic and English translation keys in sync', () => {
    expect(leafKeys(translations.ar).sort()).toEqual(leafKeys(translations.en).sort());
  });
});
