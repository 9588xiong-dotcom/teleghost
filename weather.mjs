const cities = {
  oslo: [59.91, 10.75],
  london: [51.51, -0.13],
  tokyo: [35.68, 139.69]
};

const weatherLabels = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
};

export async function loadCurrentConditions(city, { signal, fetcher = fetch } = {}) {
  if (!Object.hasOwn(cities, city)) throw new RangeError('Unsupported city');

  const [latitude, longitude] = cities[city];
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude, longitude, timezone: 'auto', temperature_unit: 'celsius', wind_speed_unit: 'kmh',
    current: 'temperature_2m,apparent_temperature,wind_speed_10m,weather_code'
  });
  const response = await fetcher(url, { signal });
  if (!response.ok) throw new Error(`Weather provider returned HTTP ${response.status}`);

  const { current, current_units: units, timezone } = await response.json();
  if (
    !current || units?.temperature_2m !== '°C' || units.apparent_temperature !== '°C' ||
    units.wind_speed_10m !== 'km/h' || typeof timezone !== 'string' || !timezone ||
    typeof current.time !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(current.time) ||
    ![current.temperature_2m, current.apparent_temperature, current.wind_speed_10m].every(Number.isFinite)
  ) {
    throw new Error('Weather provider returned incomplete conditions');
  }

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    wind: current.wind_speed_10m,
    summary: weatherLabels[current.weather_code] ?? 'Conditions',
    localTime: current.time.replace('T', ' '),
    timezone
  };
}
