import fs from 'fs';
import path from 'path';
import type { CropRecommendationInput, CropRecommendation } from "@shared/schema";

interface CropDataRow {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  label: string;
}

let cropDataCache: CropDataRow[] | null = null;

function loadCropData(): CropDataRow[] {
  if (cropDataCache) return cropDataCache;
  
  try {
    const csvPath = path.join(process.cwd(), 'server/data/crop_recommendation.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    cropDataCache = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        N: parseFloat(values[0]),
        P: parseFloat(values[1]),
        K: parseFloat(values[2]),
        temperature: parseFloat(values[3]),
        humidity: parseFloat(values[4]),
        ph: parseFloat(values[5]),
        rainfall: parseFloat(values[6]),
        label: values[7].toLowerCase()
      };
    });
    
    return cropDataCache;
  } catch (error) {
    console.error('Error loading crop data:', error);
    // Return fallback data if CSV loading fails
    return [
      { N: 90, P: 42, K: 43, temperature: 20.8, humidity: 82.0, ph: 6.5, rainfall: 202.9, label: 'rice' },
      { N: 71, P: 54, K: 16, temperature: 22.6, humidity: 63.7, ph: 5.7, rainfall: 87.8, label: 'maize' },
      { N: 19, P: 50, K: 12, temperature: 22.1, humidity: 58.2, ph: 6.4, rainfall: 226.7, label: 'wheat' }
    ];
  }
}

function calculateSuitabilityKNN(input: CropRecommendationInput, cropData: CropDataRow[], k: number = 5): CropRecommendation[] {
  // Calculate Euclidean distance for each crop data point
  const distances = cropData.map(crop => {
    const tempDiff = (input.temperature - crop.temperature) / 10; // Normalize
    const humidityDiff = (input.humidity - crop.humidity) / 100;
    const phDiff = (input.soilPh - crop.ph) / 14;
    const rainfallDiff = (input.rainfall - crop.rainfall) / 500;
    
    const distance = Math.sqrt(
      tempDiff * tempDiff +
      humidityDiff * humidityDiff +
      phDiff * phDiff +
      rainfallDiff * rainfallDiff
    );
    
    return { ...crop, distance };
  });
  
  // Sort by distance and take k nearest neighbors
  const nearest = distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  
  // Count occurrences of each crop
  const cropCounts: Record<string, { count: number; avgDistance: number }> = {};
  nearest.forEach(item => {
    if (!cropCounts[item.label]) {
      cropCounts[item.label] = { count: 0, avgDistance: 0 };
    }
    cropCounts[item.label].count++;
    cropCounts[item.label].avgDistance += item.distance;
  });
  
  // Calculate average distance and suitability score
  const recommendations: CropRecommendation[] = Object.entries(cropCounts)
    .map(([cropName, data]) => ({
      cropName: cropName.charAt(0).toUpperCase() + cropName.slice(1),
      suitability: Math.max(0, 100 - (data.avgDistance / data.count) * 100)
    }))
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, 3);
  
  return recommendations;
}

function calculateSuitability_old(crop: any, input: CropRecommendationInput): number {
  let score = 0;
  let factors = 0;

  // Temperature suitability
  const tempScore = getParameterScore(input.temperature, crop.optimalTemp);
  score += tempScore;
  factors++;

  // Humidity suitability
  const humidityScore = getParameterScore(input.humidity, crop.optimalHumidity);
  score += humidityScore;
  factors++;

  // pH suitability
  const phScore = getParameterScore(input.soilPh, crop.optimalPH);
  score += phScore;
  factors++;

  // Rainfall suitability
  const rainfallScore = getParameterScore(input.rainfall, crop.optimalRainfall);
  score += rainfallScore;
  factors++;

  // Soil type suitability
  const soilScore = crop.soilTypes.includes(input.soilType) ? 100 : 60;
  score += soilScore;
  factors++;

  return score / factors;
}

function getParameterScore(value: number, optimalRange: [number, number]): number {
  const [min, max] = optimalRange;
  
  if (value >= min && value <= max) {
    return 100; // Perfect score
  }
  
  // Calculate score based on distance from optimal range
  const midPoint = (min + max) / 2;
  const tolerance = (max - min) / 2;
  const distance = Math.abs(value - midPoint);
  
  if (distance <= tolerance) {
    return 100;
  } else if (distance <= tolerance * 2) {
    return Math.max(60, 100 - ((distance - tolerance) / tolerance) * 40);
  } else {
    return Math.max(20, 60 - ((distance - tolerance * 2) / tolerance) * 40);
  }
}

export async function getCropRecommendations(input: CropRecommendationInput): Promise<CropRecommendation[]> {
  try {
    const cropData = loadCropData();
    const recommendations = calculateSuitabilityKNN(input, cropData, 10);
    
    return recommendations.length > 0 ? recommendations : [
      { cropName: "Rice", suitability: 85 },
      { cropName: "Wheat", suitability: 78 },
      { cropName: "Maize", suitability: 72 },
    ];
  } catch (error) {
    console.error("Error generating crop recommendations:", error);
    
    // Return fallback recommendations
    return [
      { cropName: "Rice", suitability: 85 },
      { cropName: "Wheat", suitability: 78 },
      { cropName: "Maize", suitability: 72 },
    ];
  }
}
