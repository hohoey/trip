// src/hooks/useWeather.ts
import { useState, useCallback } from "react";
import type { WeatherData } from "../types";

// WMO 代碼轉描述與圖示
const weatherConfig: Record<
  number,
  { desc: string; icon: string; color: string }
> = {
  // 晴天系列
  0: { desc: "晴朗", icon: "fa-sun", color: "text-orange-400" },
  1: { desc: "主要晴朗", icon: "fa-cloud-sun", color: "text-orange-300" },
  2: { desc: "局部多雲", icon: "fa-cloud-sun", color: "text-gray-400" },
  3: { desc: "陰天", icon: "fa-cloud", color: "text-gray-500" },

  // 霧系列
  45: { desc: "霧", icon: "fa-smog", color: "text-gray-300" },
  48: { desc: "霧淞", icon: "fa-smog", color: "text-blue-100" },

  // 毛毛雨系列
  51: { desc: "輕微毛毛雨", icon: "fa-cloud-rain", color: "text-blue-200" },
  53: { desc: "毛毛雨", icon: "fa-cloud-rain", color: "text-blue-300" },
  55: {
    desc: "強烈毛毛雨",
    icon: "fa-cloud-showers-heavy",
    color: "text-blue-400",
  },

  // 下雨系列
  61: { desc: "小雨", icon: "fa-cloud-rain", color: "text-blue-400" },
  63: { desc: "中雨", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
  65: { desc: "大雨", icon: "fa-cloud-showers-heavy", color: "text-blue-700" },

  // 雨夾雪/凍雨
  66: { desc: "輕微凍雨", icon: "fa-icicles", color: "text-blue-200" },

  // 下雪系列 (2月日本必備)
  71: { desc: "小雪", icon: "fa-snowflake", color: "text-blue-100" },
  73: { desc: "中雪", icon: "fa-snowflake", color: "text-blue-200" },
  75: { desc: "大雪", icon: "fa-snowflake", color: "text-blue-300" },
  77: { desc: "雪粒", icon: "fa-snowflake", color: "text-gray-200" },

  // 陣雨系列
  80: { desc: "輕微陣雨", icon: "fa-cloud-sun-rain", color: "text-blue-400" },
  81: { desc: "陣雨", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
  82: {
    desc: "強烈陣雨",
    icon: "fa-cloud-showers-heavy",
    color: "text-blue-600",
  },

  // 雷雨系列
  95: { desc: "雷雨", icon: "fa-bolt", color: "text-yellow-500" },
  96: {
    desc: "雷雨伴隨冰雹",
    icon: "fa-cloud-meatball",
    color: "text-yellow-600",
  },
};

export const useWeather = () => {
  // 改為儲存一個以城市名稱為 Key 的物件，方便管理多城市
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(false);

  const updateWeather = useCallback(async () => {
    setLoading(true);
    const CITIES = [
      { name: "大阪", lat: 34.69, lon: 135.5 },
      { name: "京都", lat: 35.01, lon: 135.76 },
      { name: "高松", lat: 34.34, lon: 134.04 },
    ];

    try {
      const newMap: Record<string, WeatherData> = {};

      await Promise.all(
        CITIES.map(async (city) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=Asia%2FTokyo`;

          const res = await fetch(url);
          const data = await res.json();

          const current = data.current;
          const daily = data.daily;
          const code = current.weather_code;

          // ... 其他代碼保持不變
          newMap[city.name] = {
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            desc: weatherConfig[code]?.desc || "局部多雲",
            icon: weatherConfig[code]?.icon || "fa-cloud-sun",
            color: weatherConfig[code]?.color || "text-gray-400",
            rainProb: daily.precipitation_probability_max[0],
            wind: Math.round(current.wind_speed_10m),
            maxTemp: Math.round(daily.temperature_2m_max[0]),
            minTemp: Math.round(daily.temperature_2m_min[0]),
            sunrise: daily.sunrise[0].split("T")[1],
            sunset: daily.sunset[0].split("T")[1],
          };
        }),
      );

      setWeatherMap(newMap);
    } catch (error) {
      console.error("Weather Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { weatherMap, loading, updateWeather };
};
