import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { uploadImageForDiseaseDetection } from "@/lib/apis";
import { useToast } from "@/hooks/use-toast";
import type { DiseaseDetection } from "@shared/schema";

export default function DiseaseDetection() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<DiseaseDetection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const response = await uploadImageForDiseaseDetection(file);
      setResult(response);
      
      toast({
        title: "Analysis complete",
        description: "Disease detection analysis has been completed",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
      console.error("Disease detection error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Plant Disease Detection</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <div className="mb-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">Upload a leaf image for analysis</p>
        <p className="text-sm text-gray-500 mb-4">Supported formats: JPG, PNG (max 5MB)</p>
        <Button
          onClick={handleChooseFile}
          disabled={isUploading}
          className="ag-green-500 text-white hover:ag-green-600"
        >
          {isUploading ? "Analyzing..." : "Choose File"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">{result.diseaseName}</h3>
                <p className="text-sm text-red-700 mt-1">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
                <p className="text-sm text-red-600 mt-2">{result.symptoms}</p>
                <div className="mt-3">
                  <h4 className="font-medium text-red-800">Treatment:</h4>
                  <p className="text-sm text-red-700">{result.treatment}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
