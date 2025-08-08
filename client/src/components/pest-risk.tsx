import type { SensorData, WeatherData } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface PestRiskProps {
  sensorData?: SensorData;
  weatherData?: WeatherData;
}

export default function PestRisk({ sensorData, weatherData }: PestRiskProps) {
  // Calculate NDVI from light sensor data
  const ndviValue = sensorData?.lightVal ? 
    (sensorData.lightVal - (255 - sensorData.lightVal)) / (sensorData.lightVal + (255 - sensorData.lightVal)) 
    : 0;

  const { data: riskData } = useQuery({
    queryKey: ["/api/pest-risk", sensorData?.vocVal, weatherData?.humidity, ndviValue, sensorData?.soilVal],
    queryFn: async () => {
      if (!sensorData || !weatherData) return null;
      
      const response = await fetch(`/api/pest-risk?humidity=${weatherData.humidity}&ndvi=${ndviValue}&voc=${sensorData.vocVal}&soilMoisture=${sensorData.soilVal}`);
      if (!response.ok) throw new Error('Failed to fetch pest risk data');
      return response.json();
    },
    enabled: !!(sensorData && weatherData),
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return { bg: "bg-ag-green-100", text: "text-ag-green-700", bar: "bg-ag-green-500" };
      case "Medium": return { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-500" };
      case "High": return { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" };
      default: return { bg: "bg-gray-100", text: "text-gray-700", bar: "bg-gray-500" };
    }
  };

  const getRiskPercentage = (risk: string) => {
    switch (risk) {
      case "Low": return 20;
      case "Medium": return 45;
      case "High": return 80;
      default: return 0;
    }
  };

  const overallRisk = riskData?.overallRisk || "Low";
  const overallColors = getRiskColor(overallRisk);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Pest Risk Assessment</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Overall Risk</span>
          <span className={`${overallColors.bg} ${overallColors.text} px-3 py-1 rounded-full text-sm font-semibold`}>
            {overallRisk}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Humidity Risk</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getRiskColor(riskData?.humidityRisk || "Low").bar} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${getRiskPercentage(riskData?.humidityRisk || "Low")}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getRiskColor(riskData?.humidityRisk || "Low").text}`}>
                {riskData?.humidityRisk || "Low"}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">NDVI Risk</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getRiskColor(riskData?.ndviRisk || "Low").bar} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${getRiskPercentage(riskData?.ndviRisk || "Low")}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getRiskColor(riskData?.ndviRisk || "Low").text}`}>
                {riskData?.ndviRisk || "Low"}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">VOC Risk</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getRiskColor(riskData?.vocRisk || "Low").bar} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${getRiskPercentage(riskData?.vocRisk || "Low")}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getRiskColor(riskData?.vocRisk || "Low").text}`}>
                {riskData?.vocRisk || "Low"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
