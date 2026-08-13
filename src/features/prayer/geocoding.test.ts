import { isPlaceTrustworthy } from './location';
import { manualPlaceFromResult, searchManualPlaces } from './geocoding';

const KUWAIT_RESULT = {
  place_id: 123,
  display_name: 'Kuwait City, Al Asimah, Kuwait',
  lat: '29.3759',
  lon: '47.9774',
  licence: 'Data © OpenStreetMap contributors, ODbL 1.0',
  address: { city: 'Kuwait City', country: 'Kuwait', country_code: 'kw' },
};

function response(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}

describe('manual prayer place search', () => {
  it('does not make a request for an empty submitted query', async () => {
    const fetcher = jest.fn();

    await expect(searchManualPlaces('   ', 'en', fetcher)).resolves.toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('submits one localized, identified Nominatim request', async () => {
    const fetcher = jest.fn().mockResolvedValue(response([KUWAIT_RESULT]));

    const results = await searchManualPlaces('Kuwait City', 'ar', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toContain('format=jsonv2');
    expect(url).toContain('accept-language=ar');
    expect(url).toContain('q=Kuwait+City');
    expect(init.headers['User-Agent']).toContain('Athar');
    expect(results).toEqual([
      {
        id: '123',
        label: 'Kuwait City, Al Asimah, Kuwait',
        latitude: 29.3759,
        longitude: 47.9774,
        countryCode: 'KW',
      },
    ]);
  });

  it('drops malformed coordinates instead of saving an invalid place', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response([{ ...KUWAIT_RESULT, place_id: 999, lat: 'not-a-number' }]),
    );

    await expect(searchManualPlaces('Kuwait', 'en', fetcher)).resolves.toEqual([]);
  });

  it('surfaces a network failure for the setup screen to explain', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(searchManualPlaces('Toronto', 'en', fetcher)).rejects.toThrow(
      'Could not search for that city',
    );
  });

  it('turns a selected result into a trusted manual place with an IANA timezone', () => {
    const now = Date.parse('2026-08-11T12:00:00.000Z');
    const place = manualPlaceFromResult(
      {
        id: '123',
        label: 'Kuwait City, Al Asimah, Kuwait',
        latitude: 29.3759,
        longitude: 47.9774,
        countryCode: 'KW',
      },
      now,
    );

    expect(place).toMatchObject({ timezone: 'Asia/Kuwait', source: 'manual' });
    expect(isPlaceTrustworthy(place, now)).toBe(true);
  });
});
