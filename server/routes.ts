import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { getThingSpeakData, getThingSpeakHistory } from "./services/thingspeak";
import { getWeatherData } from "./services/weather";
import { detectPlantDisease } from "./services/plantid";
import { sendRainAlert } from "./services/email";
import { calculatePestRisk } from "./services/pest-risk";
import { getCropRecommendations } from "./services/crop-recommendation";
import { cropRecommendationInputSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ThingSpeak sensor data endpoints
  app.get("/api/thingspeak", async (req, res) => {
    try {
      const data = await getThingSpeakData();
      res.json(data);
    } catch (error) {
      console.error("ThingSpeak API error:", error);
      res.status(500).json({ 
        message: "Failed to fetch sensor data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/thingspeak/history", async (req, res) => {
    try {
      const data = await getThingSpeakHistory();
      res.json(data);
    } catch (error) {
      console.error("ThingSpeak history API error:", error);
      res.status(500).json({ 
        message: "Failed to fetch historical sensor data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Weather data endpoint with optional coordinates
  app.get("/api/weather/:lat?/:lon?", async (req, res) => {
    try {
      const lat = req.params.lat ? parseFloat(req.params.lat) : undefined;
      const lon = req.params.lon ? parseFloat(req.params.lon) : undefined;
      
      const data = await getWeatherData(lat, lon);
      res.json(data);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ 
        message: "Failed to fetch weather data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // NDVI calculation endpoint
  app.get("/api/ndvi", async (req, res) => {
    try {
      const { lightVal } = req.query;
      
      if (!lightVal) {
        return res.status(400).json({ 
          message: "Light value is required" 
        });
      }

      const IR = Number(lightVal);
      const R = 255 - IR;
      const ndviValue = (IR - R) / (IR + R);

      // Generate 10x10 grid with random noise
      const grid: number[][] = [];
      for (let i = 0; i < 10; i++) {
        const row: number[] = [];
        for (let j = 0; j < 10; j++) {
          const noise = (Math.random() - 0.5) * 0.4;
          const cellNDVI = Math.max(0, Math.min(1, ndviValue + noise));
          row.push(cellNDVI);
        }
        grid.push(row);
      }

      res.json({
        value: ndviValue,
        grid
      });
    } catch (error) {
      console.error("NDVI calculation error:", error);
      res.status(500).json({ 
        message: "Failed to calculate NDVI",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Plant disease detection endpoint
  app.post("/api/plantid", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "Image file is required" 
        });
      }

      const result = await detectPlantDisease(req.file);
      res.json(result);
    } catch (error) {
      console.error("Plant disease detection error:", error);
      res.status(500).json({ 
        message: "Failed to detect plant disease",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Crop recommendation endpoint
  app.post("/api/crop-recommendation", async (req, res) => {
    try {
      const validatedData = cropRecommendationInputSchema.parse(req.body);
      const recommendations = await getCropRecommendations(validatedData);
      res.json(recommendations);
    } catch (error) {
      console.error("Crop recommendation error:", error);
      res.status(500).json({ 
        message: "Failed to get crop recommendations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Pest risk assessment endpoint
  app.get("/api/pest-risk", async (req, res) => {
    try {
      const { humidity, ndvi, voc, soilMoisture } = req.query;
      
      const riskData = calculatePestRisk({
        humidity: Number(humidity) || 0,
        ndvi: Number(ndvi) || 0,
        voc: Number(voc) || 0,
        soilMoisture: Number(soilMoisture) || 0,
      });

      res.json(riskData);
    } catch (error) {
      console.error("Pest risk calculation error:", error);
      res.status(500).json({ 
        message: "Failed to calculate pest risk",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Email alert endpoint
  app.post("/api/send-alert", async (req, res) => {
    try {
      const { email, message, subject } = req.body;
      
      if (!email || !message || !subject) {
        return res.status(400).json({ 
          message: "Email, message, and subject are required" 
        });
      }

      await sendRainAlert(email, message, subject);
      res.json({ success: true, message: "Alert sent successfully" });
    } catch (error) {
      console.error("Email alert error:", error);
      res.status(500).json({ 
        message: "Failed to send alert",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
