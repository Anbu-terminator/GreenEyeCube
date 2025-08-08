import { motion } from "framer-motion";
import type { SensorData } from "@shared/schema";

interface QuickStatsProps {
  sensorData?: SensorData;
}

export default function QuickStats({ sensorData }: QuickStatsProps) {
  const getStatusColor = (value: number, optimal: [number, number]) => {
    if (value >= optimal[0] && value <= optimal[1]) {
      return "text-ag-green-600";
    }
    return "text-yellow-600";
  };

  const stats = [
    {
      title: "Soil Moisture",
      value: sensorData?.soilVal ? `${sensorData.soilVal}%` : "Loading...",
      status: sensorData?.soilVal ? (sensorData.soilVal >= 30 && sensorData.soilVal <= 70 ? "Optimal" : "Monitor") : "Loading",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      bgColor: "bg-blue-100",
    },
    {
      title: "Light Intensity",
      value: sensorData?.lightVal ? `${sensorData.lightVal} lux` : "Loading...",
      status: sensorData?.lightVal ? (sensorData.lightVal >= 1000 ? "Good" : "Low") : "Loading",
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: "bg-yellow-100",
    },
    {
      title: "VOC Level",
      value: sensorData?.vocVal ? `${sensorData.vocVal} ppm` : "Loading...",
      status: sensorData?.vocVal ? (sensorData.vocVal < 300 ? "Normal" : "High") : "Loading",
      icon: (
        <svg className="w-6 h-6 text-ag-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      bgColor: "bg-ag-green-100",
    },
    {
      title: "Pest Risk",
      value: "Low",
      status: "All Clear",
      icon: (
        <svg className="w-6 h-6 text-ag-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-ag-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm font-medium ${getStatusColor(0, [0, 1])}`}>
                {stat.status}
              </p>
            </div>
            <div className={`${stat.bgColor} rounded-lg p-3`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
