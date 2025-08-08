import type { WeatherData } from "@shared/schema";

interface WeatherAlertProps {
  weatherData?: WeatherData;
}

export default function WeatherAlert({ weatherData }: WeatherAlertProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Weather</h2>
      <div 
        className="relative h-32 rounded-lg overflow-hidden mb-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=160')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-2xl font-bold">
            {weatherData?.temperature ? `${Math.round(weatherData.temperature)}°C` : "Loading..."}
          </p>
          <p className="text-sm opacity-90">
            {weatherData?.description || "Loading..."}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Humidity</span>
          <span className="font-semibold">
            {weatherData?.humidity ? `${Math.round(weatherData.humidity)}%` : "Loading..."}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Wind Speed</span>
          <span className="font-semibold">
            {weatherData?.windSpeed ? `${Math.round(weatherData.windSpeed)} km/h` : "Loading..."}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pressure</span>
          <span className="font-semibold">
            {weatherData?.pressure ? `${Math.round(weatherData.pressure)} hPa` : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}
