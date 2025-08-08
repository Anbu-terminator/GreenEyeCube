import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCropRecommendations } from "@/lib/apis";
import { useToast } from "@/hooks/use-toast";
import { cropRecommendationInputSchema, type CropRecommendationInput, type CropRecommendation } from "@shared/schema";

export default function CropRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CropRecommendationInput>({
    resolver: zodResolver(cropRecommendationInputSchema),
    defaultValues: {
      temperature: 25,
      humidity: 65,
      soilPh: 6.5,
      rainfall: 150,
      soilType: "Loamy",
    },
  });

  const onSubmit = async (data: CropRecommendationInput) => {
    setIsLoading(true);
    setRecommendations([]);

    try {
      const response = await getCropRecommendations(data);
      setRecommendations(response);
      
      toast({
        title: "Recommendations generated",
        description: "Crop recommendations have been generated based on your inputs",
      });
    } catch (error) {
      toast({
        title: "Failed to get recommendations",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Crop recommendation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Crop Recommendation</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              {...register("temperature", { valueAsNumber: true })}
              placeholder="25"
            />
            {errors.temperature && (
              <p className="text-sm text-red-600 mt-1">{errors.temperature.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="humidity">Humidity (%)</Label>
            <Input
              id="humidity"
              type="number"
              {...register("humidity", { valueAsNumber: true })}
              placeholder="65"
            />
            {errors.humidity && (
              <p className="text-sm text-red-600 mt-1">{errors.humidity.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="soilPh">Soil pH</Label>
            <Input
              id="soilPh"
              type="number"
              step="0.1"
              {...register("soilPh", { valueAsNumber: true })}
              placeholder="6.5"
            />
            {errors.soilPh && (
              <p className="text-sm text-red-600 mt-1">{errors.soilPh.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="rainfall">Rainfall (mm)</Label>
            <Input
              id="rainfall"
              type="number"
              {...register("rainfall", { valueAsNumber: true })}
              placeholder="150"
            />
            {errors.rainfall && (
              <p className="text-sm text-red-600 mt-1">{errors.rainfall.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="soilType">Soil Type</Label>
          <Select onValueChange={(value) => setValue("soilType", value as any)} defaultValue="Loamy">
            <SelectTrigger>
              <SelectValue placeholder="Select soil type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Loamy">Loamy</SelectItem>
              <SelectItem value="Sandy">Sandy</SelectItem>
              <SelectItem value="Clay">Clay</SelectItem>
              <SelectItem value="Silty">Silty</SelectItem>
            </SelectContent>
          </Select>
          {errors.soilType && (
            <p className="text-sm text-red-600 mt-1">{errors.soilType.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full ag-green-500 text-white hover:ag-green-600"
        >
          {isLoading ? "Generating..." : "Get Recommendations"}
        </Button>
      </form>

      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-gray-900">Recommended Crops:</h3>
            {recommendations.map((crop, index) => (
              <motion.div
                key={crop.cropName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 ag-green-50 rounded-lg border border-ag-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 ag-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{crop.cropName}</span>
                </div>
                <span className="text-ag-green-600 font-semibold">
                  {Math.round(crop.suitability)}%
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
