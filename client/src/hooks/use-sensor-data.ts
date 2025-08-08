import { useQuery } from "@tanstack/react-query";
import type { SensorData } from "@shared/schema";

export function useSensorData() {
  return useQuery<SensorData>({
    queryKey: ["/api/thingspeak"],
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });
}
