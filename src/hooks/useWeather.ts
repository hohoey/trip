// src/hooks/useWeather.ts
import { useState, useCallback } from "react";
import type { WeatherData } from "../types";

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 5,
    feelsLike: 2,
    desc: "晴時多雲",
    icon: "fa-sun",
    rainProb: 10,
    wind: 12,
    maxTemp: 8,
    minTemp: 1,
    sunrise: "06:45",
    sunset: "17:10",
  });

  const updateWeather = useCallback(async (city: string) => {
    console.log("正在獲取天氣：", city);

    // 模擬 API 響應，這解決了 TS6133 'setWeather'
    // 在真實場景，這裡會是 fetch("...").then(res => res.json())
    const mockData: WeatherData = {
      temp: 7,
      feelsLike: 4,
      desc: "局部多雲",
      icon: "fa-cloud-sun",
      rainProb: 5,
      wind: 10,
      maxTemp: 10,
      minTemp: 2,
      sunrise: "06:44",
      sunset: "17:12",
    };

    setWeather(mockData);
  }, []);

  return { weather, updateWeather };
};
