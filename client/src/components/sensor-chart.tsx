import { useEffect, useRef } from "react";
import { useSensorData } from "@/hooks/use-sensor-data";
import { useQuery } from "@tanstack/react-query";

export default function SensorChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { data: latestData } = useSensorData();
  
  // Fetch historical data for the chart
  const { data: chartData } = useQuery({
    queryKey: ["/api/thingspeak/history"],
    refetchInterval: 15000,
  });

  useEffect(() => {
    const loadChart = async () => {
      // Dynamically import Chart.js to avoid SSR issues
      const Chart = await import('chart.js');
      Chart.Chart.register(...Chart.registerables);

      if (chartRef.current && chartData) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          // Destroy existing chart if it exists
          Chart.Chart.getChart(ctx)?.destroy();

          new Chart.Chart(ctx, {
            type: 'line',
            data: {
              labels: (chartData as any).timestamps || [],
              datasets: [
                {
                  label: 'Soil Moisture (%)',
                  data: (chartData as any).soilData || [],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Light Intensity (lux)',
                  data: (chartData as any).lightData || [],
                  borderColor: 'rgb(245, 158, 11)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  tension: 0.4,
                  fill: true,
                  yAxisID: 'y1',
                },
                {
                  label: 'VOC Level (ppm)',
                  data: (chartData as any).vocData || [],
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
            },
          });
        }
      }
    };

    loadChart();
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Live Sensor Data</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 ag-green-500 rounded-full animate-pulse-slow"></div>
          <span className="text-sm text-gray-500">Auto-refresh: 15s</span>
        </div>
      </div>
      <div className="h-80">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
