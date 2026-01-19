
import { GoogleGenAI, Type } from "@google/genai";
import { FarmerData } from "../types";

export const extractFarmerDataFromImage = async (base64DataUrl: string): Promise<Partial<FarmerData> | null> => {
  // Always create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Extract mimeType and base64 data correctly
  const mimeTypeMatch = base64DataUrl.match(/^data:(.*);base64,(.*)$/);
  if (!mimeTypeMatch) {
    console.error("Invalid base64 data format provided to service.");
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
            text: `Extract all farmer and land details from this image. This is a document for the Agri Record Management System.
            
            Return the following fields in JSON:
            - nameHindi: Name in Hindi script.
            - nameEnglish: Name in English (Capital Letters).
            - dob: Date of Birth in DD/MM/YYYY.
            - gender: "Male", "Female", or "Other".
            - mobile: 10-digit mobile number.
            - aadhaar: 12-digit Aadhaar number.
            - farmerId: Farmer Registration ID if present.
            - address: Full permanent address.
            - landDetails: An array of objects with fields: district, subDistrict, village, mOwnerNo (Khata No), khasra (Plot No), area (in Acres).
            
            If a field is not found, leave it as an empty string. If no land records are found, return an empty array for landDetails.`,
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
      return JSON.parse(text);
    }
    return null;
  } catch (error: any) {
    console.error("Gemini Extraction Error Detail:", error);
    // Bubble up the error message for the UI to display
    throw new Error(error.message || "Failed to extract data from image");
  }
};
