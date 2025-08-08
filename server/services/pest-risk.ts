import type { PestRisk } from "@shared/schema";

interface PestRiskInput {
  humidity: number;
  ndvi: number;
  voc: number;
  soilMoisture: number;
}

export function calculatePestRisk(input: PestRiskInput): PestRisk {
  const { humidity, ndvi, voc, soilMoisture } = input;

  // Calculate individual risk factors based on the specified logic
  const humidityRisk = humidity > 80 ? "High" : humidity > 60 ? "Medium" : "Low";
  const ndviRisk = ndvi < 0.4 ? "High" : ndvi < 0.6 ? "Medium" : "Low";
  const vocRisk = voc > 300 ? "High" : voc > 200 ? "Medium" : "Low";
  const soilMoistureRisk = soilMoisture > 60 ? "Medium" : soilMoisture > 40 ? "Low" : "Medium";

  // Calculate overall risk based on individual factors
  const riskScores = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
  };

  const totalRiskScore = 
    riskScores[humidityRisk] + 
    riskScores[ndviRisk] + 
    riskScores[vocRisk] + 
    riskScores[soilMoistureRisk];

  const averageRisk = totalRiskScore / 4;

  let overallRisk: "Low" | "Medium" | "High";
  if (averageRisk <= 1.5) {
    overallRisk = "Low";
  } else if (averageRisk <= 2.5) {
    overallRisk = "Medium";
  } else {
    overallRisk = "High";
  }

  return {
    overallRisk,
    humidityRisk,
    ndviRisk,
    vocRisk,
    soilMoistureRisk,
  };
}
