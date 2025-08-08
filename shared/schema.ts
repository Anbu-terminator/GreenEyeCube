import { z } from "zod";

// ThingSpeak sensor data schema
export const sensorDataSchema = z.object({
  angle: z.number(),
  vocVal: z.number(),
  soilVal: z.number(),
  lightVal: z.number(),
  timestamp: z.string(),
});

export type SensorData = z.infer<typeof sensorDataSchema>;

// Weather data schema
export const weatherDataSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  pressure: z.number(),
  description: z.string(),
  hasRainForecast: z.boolean(),
  location: z.string(),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

// NDVI data schema
export const ndviDataSchema = z.object({
  value: z.number(),
  grid: z.array(z.array(z.number())),
});

export type NDVIData = z.infer<typeof ndviDataSchema>;

// Plant disease detection schema
export const diseaseDetectionSchema = z.object({
  diseaseName: z.string(),
  confidence: z.number(),
  symptoms: z.string(),
  treatment: z.string(),
});

export type DiseaseDetection = z.infer<typeof diseaseDetectionSchema>;

// Crop recommendation schema
export const cropRecommendationInputSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  soilPh: z.number(),
  rainfall: z.number(),
  soilType: z.enum(["Loamy", "Sandy", "Clay", "Silty"]),
});

export const cropRecommendationSchema = z.object({
  cropName: z.string(),
  suitability: z.number(),
});

export type CropRecommendationInput = z.infer<typeof cropRecommendationInputSchema>;
export type CropRecommendation = z.infer<typeof cropRecommendationSchema>;

// Pest risk assessment schema
export const pestRiskSchema = z.object({
  overallRisk: z.enum(["Low", "Medium", "High"]),
  humidityRisk: z.enum(["Low", "Medium", "High"]),
  ndviRisk: z.enum(["Low", "Medium", "High"]),
  vocRisk: z.enum(["Low", "Medium", "High"]),
  soilMoistureRisk: z.enum(["Low", "Medium", "High"]),
});

export type PestRisk = z.infer<typeof pestRiskSchema>;

// Email alert schema
export const emailAlertSchema = z.object({
  email: z.string().email(),
  message: z.string(),
  subject: z.string(),
});

export type EmailAlert = z.infer<typeof emailAlertSchema>;
