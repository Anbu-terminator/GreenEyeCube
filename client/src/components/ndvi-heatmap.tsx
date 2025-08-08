import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SensorData } from "@shared/schema";

interface NDVIHeatmapProps {
  sensorData?: SensorData;
}

export default function NDVIHeatmap({ sensorData }: NDVIHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !sensorData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate NDVI from light sensor value (field 4 photoresistor)
    // NDVI = (NIR - Red) / (NIR + Red)
    // Using light sensor as proxy: IR = lightVal, Red = 1024 - lightVal
    const lightVal = sensorData.lightVal || 512; // Default mid-range value
    const ir = lightVal;
    const red = 1024 - lightVal; // Inverted for realistic NDVI
    const baseNDVI = (ir - red) / (ir + red);

    // Generate realistic field-like heatmap pattern
    const gridSize = 64; // Higher resolution for more detailed map
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Create noise patterns similar to the provided image
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Create field-like patterns with varying vegetation density
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        
        // Distance from center for radial patterns
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        // Multiple noise layers for realistic field variation
        const noise1 = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.2;
        const noise2 = Math.sin(x * 0.8 + y * 0.5) * 0.15;
        const noise3 = Math.random() * 0.1 - 0.05; // Random variation
        
        // Field boundaries and crop rows
        const fieldPattern = Math.sin(x * 0.1) * 0.1 + Math.cos(y * 0.15) * 0.1;
        
        // Distance-based variation (fields often have gradients)
        const distanceEffect = (1 - distFromCenter / (gridSize * 0.7)) * 0.2;
        
        // Combine all variations
        let localNDVI = baseNDVI + noise1 + noise2 + noise3 + fieldPattern + distanceEffect;
        
        // Add some field-specific patterns
        if (x % 8 < 2 || y % 12 < 2) {
          localNDVI *= 0.7; // Field boundaries/paths
        }
        
        // Clamp NDVI to realistic range
        localNDVI = Math.max(-0.3, Math.min(0.8, localNDVI));

        // Enhanced color mapping based on actual NDVI color schemes
        let color;
        if (localNDVI < -0.1) {
          // Water/bare soil - browns and blues
          const intensity = Math.abs(localNDVI + 0.1) / 0.2;
          const r = Math.floor(101 + intensity * 50);
          const g = Math.floor(67 + intensity * 30);
          const b = Math.floor(33 + intensity * 20);
          color = `rgb(${r},${g},${b})`;
        } else if (localNDVI < 0.1) {
          // Very sparse vegetation - yellow/tan
          const intensity = localNDVI / 0.2 + 0.5;
          const r = Math.floor(180 + intensity * 40);
          const g = Math.floor(150 + intensity * 50);
          const b = Math.floor(80 + intensity * 20);
          color = `rgb(${r},${g},${b})`;
        } else if (localNDVI < 0.3) {
          // Low vegetation - light green
          const intensity = (localNDVI - 0.1) / 0.2;
          const r = Math.floor(120 - intensity * 60);
          const g = Math.floor(160 + intensity * 60);
          const b = Math.floor(60 + intensity * 40);
          color = `rgb(${r},${g},${b})`;
        } else if (localNDVI < 0.5) {
          // Medium vegetation - green
          const intensity = (localNDVI - 0.3) / 0.2;
          const r = Math.floor(60 - intensity * 30);
          const g = Math.floor(140 + intensity * 80);
          const b = Math.floor(40 + intensity * 20);
          color = `rgb(${r},${g},${b})`;
        } else {
          // Dense vegetation - dark green
          const intensity = Math.min(1, (localNDVI - 0.5) / 0.3);
          const r = Math.floor(30 - intensity * 20);
          const g = Math.floor(100 + intensity * 50);
          const b = Math.floor(30 - intensity * 15);
          color = `rgb(${r},${g},${b})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }

    // Add subtle field boundaries
    ctx.strokeStyle = "rgba(139, 69, 19, 0.3)";
    ctx.lineWidth = 1;
    
    // Vertical field lines
    for (let x = 0; x < gridSize; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, height);
      ctx.stroke();
    }
    
    // Horizontal field lines
    for (let y = 0; y < gridSize; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(width, y * cellHeight);
      ctx.stroke();
    }
    
    // Add scale indicator
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(width - 80, height - 30, 70, 20);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, height - 30, 70, 20);
    
    ctx.fillStyle = "#333";
    ctx.font = "10px Arial";
    ctx.fillText("100m", width - 70, height - 18);
    
  }, [sensorData]);

  const ndviValue = sensorData ? 
    ((sensorData.lightVal - (1024 - sensorData.lightVal)) / (sensorData.lightVal + (1024 - sensorData.lightVal))) : 0;

  const getHealthStatus = (ndvi: number) => {
    if (ndvi > 0.4) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (ndvi > 0.2) return { status: "Good", color: "text-green-500", bg: "bg-green-50" };
    if (ndvi > 0) return { status: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "Poor", color: "text-red-600", bg: "bg-red-100" };
  };

  const health = getHealthStatus(ndviValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 bg-green-500 rounded-full"
            />
            NDVI Field Analysis
            <motion.span 
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${health.bg} ${health.color}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {health.status}
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {ndviValue.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">NDVI Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sensorData?.lightVal || 0}
                </div>
                <div className="text-sm text-gray-600">Light Sensor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((ndviValue + 1) * 50)}%
                </div>
                <div className="text-sm text-gray-600">Vegetation</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                width={512}
                height={384}
                className="w-full border-2 border-green-200 rounded-lg shadow-lg bg-gray-50"
              />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                Live Field Data - {new Date().toLocaleTimeString()}
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-6 gap-3 text-xs"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(101,67,33)"}}></div>
                <span>Bare Soil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(220,200,100)"}}></div>
                <span>Sparse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(100,180,80)"}}></div>
                <span>Low Veg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(60,160,60)"}}></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(30,120,30)"}}></div>
                <span>Dense</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: "rgb(10,80,15)"}}></div>
                <span>Very Dense</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 p-4 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h4 className="font-semibold mb-2 text-gray-700">Analysis Summary</h4>
              <p className="text-sm text-gray-600">
                Field vegetation health is <strong>{health.status.toLowerCase()}</strong> based on photoresistor readings from field 4. 
                NDVI value of {ndviValue.toFixed(3)} indicates {ndviValue > 0.3 ? "healthy crop growth" : ndviValue > 0 ? "moderate vegetation" : "sparse vegetation coverage"}.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}