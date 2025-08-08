import { apiRequest } from "./queryClient";

export const uploadImageForDiseaseDetection = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await apiRequest('POST', '/api/plantid', formData);
  return response.json();
};

export const getCropRecommendations = async (data: any) => {
  const response = await apiRequest('POST', '/api/crop-recommendation', data);
  return response.json();
};

export const sendRainAlert = async (email: string) => {
  const response = await apiRequest('POST', '/api/send-alert', { email });
  return response.json();
};
