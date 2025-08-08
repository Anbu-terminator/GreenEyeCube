import axios from "axios";
import type { WeatherData } from "@shared/schema";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "cd81c0ca27ba43bead299707e76f33a0";

export async function getWeatherData(lat?: number, lon?: number): Promise<WeatherData> {
  // Use default coordinates if not provided (San Francisco)
  const latitude = lat || 37.7749;
  const longitude = lon || -122.4194;
  try {
    // Get current weather
    const currentResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
        timeout: 10000,
      }
    );

    // Get 24-hour forecast to check for rain
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: WEATHER_API_KEY,
          units: "metric",
          cnt: 8, // 24 hours (8 * 3-hour intervals)
        },
        timeout: 10000,
      }
    );

    const current = currentResponse.data;
    const forecast = forecastResponse.data;

    // Check if rain is forecast in next 24 hours
    const hasRainForecast = forecast.list.some((item: any) => 
      item.weather.some((weather: any) => 
        weather.main.toLowerCase().includes('rain')
      )
    );

    return {
      temperature: current.main.temp,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed * 3.6, // Convert m/s to km/h
      pressure: current.main.pressure,
      description: current.weather[0].description,
      hasRainForecast,
      location: current.name,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    
    // Return fallback data
    return {
      temperature: 24,
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      description: "Partly Cloudy",
      hasRainForecast: false,
      location: "Unknown Location",
    };
  }
}
