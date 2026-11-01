import { WeatherData, WeatherForecastDay } from '../types';

export function decodeWmoWeather(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Depositing Rime';
    case 51:
      return 'Light Drizzle';
    case 53:
      return 'Moderate Drizzle';
    case 55:
      return 'Dense Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
      return 'Slight Snow';
    case 73:
      return 'Moderate Snow';
    case 75:
      return 'Heavy Snow';
    case 77:
      return 'Snow Grains';
    case 80:
      return 'Slight Rain Showers';
    case 81:
      return 'Moderate Showers';
    case 82:
      return 'Violent Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Variable Conditions';
  }
}

interface OpenMeteoRawResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max: number[];
  };
}

// In-memory weather cache to prevent repeated identical calls (TTL: 10 minutes)
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<{ data: WeatherData | null; error: string | null }> {
  // Key rounded to 2 decimal places (~1.1 km precision)
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, error: null };
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max'
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '5');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });

    if (!res.ok) {
      return {
        data: null,
        error: `Weather service returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const json: OpenMeteoRawResponse = await res.json();

    if (!json.current) {
      return {
        data: null,
        error: 'Telemetry missing current conditions payload.',
      };
    }

    const dailyForecasts: WeatherForecastDay[] = [];
    if (json.daily && json.daily.time) {
      for (let i = 0; i < json.daily.time.length; i++) {
        dailyForecasts.push({
          date: json.daily.time[i],
          weatherCode: json.daily.weather_code[i] ?? 0,
          weatherText: decodeWmoWeather(json.daily.weather_code[i] ?? 0),
          tempMax: json.daily.temperature_2m_max[i] ?? 0,
          tempMin: json.daily.temperature_2m_min[i] ?? 0,
          precipitationSum: json.daily.precipitation_sum[i] ?? 0,
          precipitationProbabilityMax: json.daily.precipitation_probability_max?.[i],
          windSpeedMax: json.daily.wind_speed_10m_max[i] ?? 0,
        });
      }
    }

    const weatherData: WeatherData = {
      latitude: json.latitude,
      longitude: json.longitude,
      elevation: json.elevation,
      timezone: json.timezone,
      current: {
        time: json.current.time,
        temperature: json.current.temperature_2m,
        apparentTemperature: json.current.apparent_temperature,
        relativeHumidity: json.current.relative_humidity_2m,
        precipitation: json.current.precipitation,
        weatherCode: json.current.weather_code,
        weatherText: decodeWmoWeather(json.current.weather_code),
        windSpeed: json.current.wind_speed_10m,
        windDirection: json.current.wind_direction_10m,
        isDay: json.current.is_day === 1,
      },
      daily: dailyForecasts,
      provider: 'Open-Meteo API',
      retrievedAt: new Date().toISOString(),
      dataTier: 'measured',
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    return { data: weatherData, error: null };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: null };
    }
    const message = err instanceof Error ? err.message : 'Weather service connection failed';
    return {
      data: null,
      error: `Open-Meteo telemetry error: ${message}`,
    };
  }
}
