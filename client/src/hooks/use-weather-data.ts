import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { WeatherData } from "@shared/schema";

export function useWeatherData() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Use default coordinates (San Francisco) if geolocation fails
          setCoordinates({ lat: 37.7749, lon: -122.4194 });
        }
      );
    } else {
      // Use default coordinates if geolocation is not supported
      setCoordinates({ lat: 37.7749, lon: -122.4194 });
    }
  }, []);

  return useQuery<WeatherData>({
    queryKey: ["/api/weather", coordinates?.lat, coordinates?.lon],
    enabled: !!coordinates,
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });
}
