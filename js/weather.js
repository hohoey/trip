const WeatherService = {
    coords: {
        '京都': { lat: 35.0116, lon: 135.7681 },
        '大阪': { lat: 34.6937, lon: 135.5023 },
        '四國': { lat: 34.3427, lon: 134.0465 } 
    },

      async getForecast(cityString) {
        const key = Object.keys(this.coords).find(k => cityString.includes(k)) || '京都';
        const { lat, lon } = this.coords[key];
        
        try {
            // 增加參數：體感溫度、降雨機率、當日最高低溫
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=Asia%2FTokyo`;
            
            const res = await fetch(url);
            const data = await res.json();
            const curr = data.current;
            const daily = data.daily;

            return {
                temp: curr.temperature_2m,
                feelsLike: curr.apparent_temperature, // 體感
                humidity: curr.relative_humidity_2m,
                wind: curr.wind_speed_10m,
                rainProb: daily.precipitation_probability_max[0], // 今日最大降雨機率
                maxTemp: daily.temperature_2m_max[0],
                minTemp: daily.temperature_2m_min[0],
                sunrise: daily.sunrise[0].split('T')[1], // 只取時間
                sunset: daily.sunset[0].split('T')[1],
                desc: this.getDesc(curr.weather_code),
                icon: this.getIcon(curr.weather_code)
            };
        } catch (e) {
            console.error(e);
            return { temp: '--', desc: '資料獲取失敗' };
        }
    },

    getDesc(code) {
        const map = { 0: '晴朗', 1: '晴間多雲', 2: '多雲', 3: '陰天', 61: '雨' };
        return map[code] || '多雲時晴';
    },

    getIcon(code) {
        const map = { 0: 'fas fa-sun', 1: 'fas fa-cloud-sun', 2: 'fas fa-cloud', 3: 'fas fa-cloud', 61: 'fas fa-cloud-showers-heavy' };
        return map[code] || 'fas fa-cloud-sun';
    }
};