import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCurrentConditions } from '../weather.mjs';

test('requests conditions in local time and preserves provider units and timestamp', async () => {
  const fetcher = async (url) => {
    assert.equal(url.origin, 'https://api.open-meteo.com');
    assert.equal(url.searchParams.get('latitude'), '59.91');
    assert.equal(url.searchParams.get('timezone'), 'auto');
    return {
      ok: true,
      json: async () => ({
        current: { temperature_2m: 6.2, apparent_temperature: 3, wind_speed_10m: 14, weather_code: 61, time: '2026-11-12T18:00' },
        current_units: { temperature_2m: '°C', apparent_temperature: '°C', wind_speed_10m: 'km/h' },
        timezone: 'Europe/Oslo'
      })
    };
  };
  assert.deepEqual(await loadCurrentConditions('oslo', { fetcher }), {
    temperature: 6.2, feelsLike: 3, wind: 14, summary: 'Light rain',
    localTime: '2026-11-12 18:00', timezone: 'Europe/Oslo'
  });
});

test('rejects a provider failure and incomplete data', async () => {
  await assert.rejects(loadCurrentConditions('oslo', {
    fetcher: async () => ({ ok: false, status: 503 })
  }), /HTTP 503/);
  await assert.rejects(loadCurrentConditions('oslo', {
    fetcher: async () => ({ ok: true, json: async () => ({ current: { temperature_2m: null } }) })
  }), /incomplete conditions/);
});
