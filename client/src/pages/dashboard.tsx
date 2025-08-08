import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import QuickStats from "@/components/quick-stats";
import SensorChart from "@/components/sensor-chart";
import NDVIHeatmap from "@/components/ndvi-heatmap";
import WeatherAlert from "@/components/weather-alert";
import PestRisk from "@/components/pest-risk";
import DiseaseDetection from "@/components/disease-detection";
import CropRecommendation from "@/components/crop-recommendation";
import { useSensorData } from "@/hooks/use-sensor-data";
import { useWeatherData } from "@/hooks/use-weather-data";

declare global {
  interface Window {
    gsap: any;
  }
}

export default function Dashboard() {
  const { data: sensorData, refetch: refetchSensor } = useSensorData();
  const { data: weatherData, refetch: refetchWeather } = useWeatherData();

  useEffect(() => {
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      refetchSensor();
      refetchWeather();
    }, 15000);

    return () => clearInterval(interval);
  }, [refetchSensor, refetchWeather]);

  useEffect(() => {
    // GSAP animations for enhanced user interactions
    if (window.gsap) {
      window.gsap.from(".dashboard-card", {
        duration: 0.6,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  }, []);

  const lastUpdateTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Enhanced Header with Navigation */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/">
                <motion.div 
                  className="bg-gradient-to-r from-ag-green-500 to-blue-500 rounded-lg p-2 cursor-pointer"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </motion.div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Green Eye Cube</h1>
                <p className="text-sm text-gray-500">Smart Agriculture Dashboard</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              <motion.div 
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Last updated: <span className="font-medium">{lastUpdateTime}</span>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-r from-ag-green-100 to-blue-100 text-ag-green-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <motion.span 
                  className="w-2 h-2 bg-ag-green-500 rounded-full inline-block mr-2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                Live Data
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <QuickStats sensorData={sensorData} />
        </motion.div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="dashboard-card"
          >
            <SensorChart />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="dashboard-card"
          >
            <NDVIHeatmap sensorData={sensorData} />
          </motion.div>
        </div>

        {/* Weather and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="dashboard-card lg:col-span-2"
          >
            <WeatherAlert weatherData={weatherData} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="dashboard-card"
          >
            <PestRisk sensorData={sensorData} weatherData={weatherData} />
          </motion.div>
        </div>

        {/* Analysis Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="dashboard-card"
          >
            <DiseaseDetection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="dashboard-card"
          >
            <CropRecommendation />
          </motion.div>
        </div>

        {/* Enhanced Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 py-8 border-t border-gray-200"
        >
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">Green Eye Cube - Smart Agriculture Dashboard</p>
            <p>Powered by ThingSpeak, OpenWeatherMap, and Plant.ID APIs</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}