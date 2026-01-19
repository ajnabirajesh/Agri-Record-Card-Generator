
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
            text: `You are an expert OCR and data extraction system for Indian Agricultural Documents (like Aadhar Card, Khatauni, Land Records, or Farmer ID).
            
            Extract the following details from the provided image:
            1. Farmer's Name in Hindi (nameHindi) and English (nameEnglish).
            2. Date of Birth (dob) in DD/MM/YYYY format.
            3. Gender (gender) as "Male", "Female", or "Other".
            4. 10-digit Mobile Number (mobile).
            5. 12-digit Aadhaar Number (aadhaar).
            6. Farmer ID / Registration ID (farmerId).
            7. Full Permanent Address (address).
            8. Land Details (landDetails): 
               - Look for "District", "Block/Sub-District", "Village/Mauja".
               - "Khata Number" or "Machine Owner Number" (mOwnerNo).
               - "Khasra/Plot Number" (khasra).
               - "Area/Rakba" (area) in Acres or Decimals.

            Return the response in JSON format. Use empty strings for missing fields.`,
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 1000 },
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
        return JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting data from Gemini:", error);
    // If it's a 404 or missing entity, it might be an API Key issue in some environments
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      alert("AI Service Error: Please check if the API is available or the image is too blurry.");
    }
    return null;
  }
};
