
import { GoogleGenAI, Type } from "@google/genai";
import { FarmerData } from "../types";

export const extractFarmerDataFromImage = async (base64DataUrl: string): Promise<Partial<FarmerData> | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Extract mimeType and base64 data from the Data URL
  const mimeTypeMatch = base64DataUrl.match(/^data:(.*);base64,(.*)$/);
  if (!mimeTypeMatch) {
    console.error("Invalid base64 data format");
    return null;
  }

  const mimeType = mimeTypeMatch[1];
  const base64Data = mimeTypeMatch[2];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Extract all possible farmer information from this identity card or land document image. 
            
            Look specifically for:
            - Name in Hindi and English.
            - Date of Birth (DOB).
            - Gender.
            - 10-digit Mobile Number.
            - 12-digit Aadhaar Number.
            - Farmer ID / Registration Number.
            - Full Address.
            - Land Details: Look for "Khata Number" (Machine Owner No), "Khasra Number", and "Area/Rakba" in Acres or Decimals.
            
            Return the data in a clean JSON format. If a field is missing, return an empty string.`,
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
    return null;
  }
};
