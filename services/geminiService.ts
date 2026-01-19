
import { GoogleGenAI, Type } from "@google/genai";
import { FarmerData } from "../types";

export const extractFarmerDataFromImage = async (base64Image: string): Promise<Partial<FarmerData> | null> => {
  // Directly initialize using the environment variable as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            text: "Extract farmer information from this card image. Return the data in a structured JSON format following the schema provided. If a field is not found, leave it empty. Ensure nameHindi and nameEnglish are separated if possible. Note: 'mOwnerNo' corresponds to the 'Khata' number found on documents.",
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
                  mOwnerNo: { 
                    type: Type.STRING,
                    description: "The Khata number or Machine Owner Number."
                  },
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
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting data from Gemini:", error);
    // Silent fail in UI but logged for developers
    return null;
  }
};
