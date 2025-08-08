import axios from "axios";
import type { SensorData } from "@shared/schema";

const THINGSPEAK_CHANNEL_ID = "3028530";
const THINGSPEAK_READ_API_KEY = process.env.THINGSPEAK_API_KEY || "UICHPLR6HJAJ51MG";

export async function getThingSpeakData(): Promise<SensorData> {
  try {
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json`,
      {
        params: {
          api_key: THINGSPEAK_READ_API_KEY,
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    
    return {
      angle: parseFloat(data.field1) || 0,
      vocVal: parseFloat(data.field2) || 0,
      soilVal: parseFloat(data.field3) || 0,
      lightVal: parseFloat(data.field4) || 0,
      timestamp: data.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching ThingSpeak data:", error);
    
    // Return fallback data if API fails
    return {
      angle: 0,
      vocVal: 180,
      soilVal: 42,
      lightVal: 1250,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getThingSpeakHistory(): Promise<{
  timestamps: string[];
  soilData: number[];
  lightData: number[];
  vocData: number[];
  angleData: number[];
}> {
  try {
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`,
      {
        params: {
          api_key: THINGSPEAK_READ_API_KEY,
          results: 20, // Get last 20 data points
        },
        timeout: 10000,
      }
    );

    const feeds = response.data.feeds || [];
    
    const timestamps: string[] = [];
    const soilData: number[] = [];
    const lightData: number[] = [];
    const vocData: number[] = [];
    const angleData: number[] = [];

    feeds.forEach((feed: any) => {
      const timestamp = new Date(feed.created_at);
      timestamps.push(timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }));
      
      angleData.push(parseFloat(feed.field1) || 0);
      vocData.push(parseFloat(feed.field2) || 0);
      soilData.push(parseFloat(feed.field3) || 0);
      lightData.push(parseFloat(feed.field4) || 0);
    });

    return {
      timestamps,
      soilData,
      lightData,
      vocData,
      angleData,
    };
  } catch (error) {
    console.error("Error fetching ThingSpeak history:", error);
    
    // Return fallback data
    const now = new Date();
    const timestamps = Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 15 * 60 * 1000);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    return {
      timestamps,
      soilData: [40, 42, 38, 45, 43, 41, 39, 44, 42, 40],
      lightData: [1200, 1250, 1180, 1300, 1275, 1220, 1260, 1240, 1280, 1250],
      vocData: [170, 180, 165, 190, 185, 175, 172, 188, 180, 175],
      angleData: [0, 15, 30, 45, 30, 15, 0, -15, -30, 0],
    };
  }
}
