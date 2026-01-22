
import { GoogleGenAI, Type } from "@google/genai";
import { MultiStudentAnalysis, Student } from "../types";

export async function analyzeClassroom(imageBase64: string, enrolledStudents: Student[]): Promise<MultiStudentAnalysis> {
  const apiKey ="AIzaSyBZAEMcZ20JV06btIqMaAKHvrxTQkMP9Q4";
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key must be set when running in a browser. Iltimos, API kalitni tanlang.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
      {
        text: `Siz Smart AI Camera tizimining yuqori aniqlikdagi yuz tahlilchisisiz. 
        Vazifangiz: Dars rasmidagi o'quvchilarni identifikatsiya qilish va ularning koordinatalari (bounding boxes) bilan birga holatini aniqlash.

        QOIDALAR:
        1. Reference rasmlar asosida o'quvchilarni tanib oling.
        2. Har bir topilgan o'quvchi uchun [ymin, xmin, ymax, xmax] formatida koordinatalarni (0-1000 oralig'ida) aniqlang.
        3. Holatlar: 'active', 'attentive', 'inactive'. Agar o'quvchi ko'rinmasa 'not_present'.
        4. Confidence (ishonch): 0.0 dan 1.0 gacha.
        5. Faqat reference bazadagi o'quvchilarni qaytaring.

        JAVOB FORMATI: JSON { results: [{ fullName, tone, explanation, confidence, box: { ymin, xmin, ymax, xmax } }] }`,
      }
    ];

    enrolledStudents.forEach(student => {
      if (student.referenceImages && student.referenceImages.length > 0) {
        parts.push({
          text: `REFERENCE BASE - O'quvchi: ${student.fullName}.`
        });
        student.referenceImages.forEach((imgBase64) => {
          parts.push({
            inlineData: { mimeType: "image/jpeg", data: imgBase64 }
          });
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  tone: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  box: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER },
                    },
                    required: ["ymin", "xmin", "ymax", "xmax"]
                  }
                },
                required: ["fullName", "tone", "explanation", "confidence"],
              },
            },
          },
          required: ["results"],
        },
      },
    });

    if (!response.text) {
      throw new Error("API'dan bo'sh javob qaytdi.");
    }

    return JSON.parse(response.text.trim()) as MultiStudentAnalysis;
  } catch (error: any) {
    console.error("Smart AI Tracking Error:", error);
    throw error;
  }
}
