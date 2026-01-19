
import { GoogleGenAI, Type } from "@google/genai";
import { FarmerData, BIHAR_DISTRICTS } from "../types";

/**
 * Utility to clean potential markdown formatting from AI response
 */
const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const extractFarmerDataFromImage = async (base64Image: string): Promise<Partial<FarmerData> | null> => {
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
            text: `Extract farmer information from this card image. 
            
            RULES:
            1. Return a valid JSON object.
            2. For 'district', match one of these valid Bihar districts exactly: ${BIHAR_DISTRICTS.join(', ')}.
            3. 'mOwnerNo' is often labeled as 'Khata' or 'खाता'.
            4. 'khasra' is often labeled as 'Plot' or 'खेसरा'.
            5. 'aadhaar' should be 12 digits (no spaces).
            6. 'mobile' should be 10 digits.
            7. If a field is not clearly visible, return an empty string "".
            
            Return data in this structure:`,
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
            dob: { type: Type.STRING, description: "Format: DD/MM/YYYY" },
            gender: { type: Type.STRING, enum: ["Male", "Female", "Other"] },
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
                  subDistrict: { type: Type.STRING, description: "The Block/Tehsil" },
                  village: { type: Type.STRING },
                  mOwnerNo: { type: Type.STRING },
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
        const cleaned = cleanJsonResponse(text);
        return JSON.parse(cleaned);
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting data from Gemini:", error);
    return null;
  }
};
