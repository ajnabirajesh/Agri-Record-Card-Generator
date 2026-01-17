
import { GoogleGenAI, Type } from "@google/genai";
import { FarmerData } from "../types";

// Safety check for process.env
const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;

export const extractFarmerDataFromImage = async (base64Image: string): Promise<Partial<FarmerData> | null> => {
  if (!apiKey) {
    console.error("API_KEY is missing. Please set it in Vercel Environment Variables.");
    alert("API Key missing! Check console for instructions.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Extract farmer information from this card image. Return the data in a structured JSON format following the schema provided. If a field is not found, leave it empty. Ensure nameHindi and nameEnglish are separated if possible.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nameHindi: { type: Type.STRING },
            nameEnglish: { type: Type.STRING },
            dob: { type: Type.STRING },
            gender: { type: Type.STRING },
            mobile: { type: Type.STRING },
            aadhaar: { type: Type.STRING },
            farmerId: { type: Type.STRING },
            address: { type: Type.STRING },
            landDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  district: { type: Type.STRING },
                  subDistrict: { type: Type.STRING },
                  village: { type: Type.STRING },
                  khata: { type: Type.STRING },
                  khasra: { type: Type.STRING },
                  area: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
};
