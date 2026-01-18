export interface TripEvent {
  day: number;
  time: string;
  location: string;
  category: "景點" | "美食" | "交通" | "購物" | string;
  address?: string;
  phone?: string;
  note?: string;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  desc: string;
  icon: string;
  rainProb: number;
  wind: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  color: string;
}
