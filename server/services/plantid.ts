import axios from "axios";
import type { DiseaseDetection } from "@shared/schema";

const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY || "r6EhXIBUPFuSAvsZQgrMNbNzTM12YxfbPokXkNEpDOVg3ai5hK";

export async function detectPlantDisease(imageFile: Express.Multer.File): Promise<DiseaseDetection> {
  try {
    const base64Image = imageFile.buffer.toString('base64');
    
    const response = await axios.post(
      'https://plant.id/api/v3/health_assessment',
      {
        images: [`data:${imageFile.mimetype};base64,${base64Image}`],
        modifiers: ["crops_fast", "similar_images"],
        disease_details: ["common_names", "url", "description", "treatment"]
      },
      {
        headers: {
          'Api-Key': PLANT_ID_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const result = response.data;
    
    if (result.health_assessment && result.health_assessment.diseases && result.health_assessment.diseases.length > 0) {
      const disease = result.health_assessment.diseases[0];
      
      return {
        diseaseName: disease.name || "Unknown Disease",
        confidence: disease.probability || 0.5,
        symptoms: disease.disease_details?.description || "Symptoms not available",
        treatment: disease.disease_details?.treatment?.biological?.[0] || 
                  disease.disease_details?.treatment?.chemical?.[0] || 
                  "Treatment information not available",
      };
    } else {
      // No diseases detected
      return {
        diseaseName: "No Disease Detected",
        confidence: 0.95,
        symptoms: "Plant appears healthy based on the analysis",
        treatment: "Continue regular plant care and monitoring",
      };
    }
  } catch (error) {
    console.error("Error in plant disease detection:", error);
    
    // Return fallback response
    return {
      diseaseName: "Analysis Error",
      confidence: 0,
      symptoms: "Unable to analyze the image. Please ensure the image is clear and shows plant leaves.",
      treatment: "Please try uploading a different image or check your internet connection",
    };
  }
}
