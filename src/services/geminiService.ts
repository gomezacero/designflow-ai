
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MagicBriefResult, TaskType, Priority } from "../models";
import { MOCK_GENERATED_BRIEF } from "../utils/constants";

const apiKey = process.env.API_KEY || 'dummy_key_for_demo';
const ai = new GoogleGenAI({ apiKey });

export const generateStructuredBrief = async (rawText: string): Promise<MagicBriefResult> => {

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Project title" },
      requester: { type: Type.STRING, description: "Name of the person requesting the design" },
      description: { type: Type.STRING, description: "Detailed description of requirements" },
      sprintPoints: { type: Type.INTEGER, description: "Fibonacci points (1, 2, 3, 5, 8)" },
      sprint: { type: Type.STRING, description: "Sprint name/number (e.g., 'Sprint 24')" },
      type: { type: Type.STRING, description: "Category", enum: Object.values(TaskType) },
      priority: { type: Type.STRING, description: "Urgency", enum: Object.values(Priority) },
      referenceLinks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Any URLs found in text" }
    },
    required: ["title", "description", "requester", "type", "priority"]
  };

  try {
    if (apiKey === 'dummy_key_for_demo') {
        throw new Error("No API Key configured");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract design task details from this text: "${rawText}". If Sprint is not mentioned, assume current 'Sprint 25'. If requester not mentioned, use 'Unknown'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    try {
      return JSON.parse(text) as MagicBriefResult;
    } catch (parseError) {
      console.warn("JSON parse error:", parseError);
      throw new Error("Invalid response format from AI");
    }

  } catch (error) {
    console.warn("Gemini API fallback:", error);

    // Fallback simulation
    return {
      ...MOCK_GENERATED_BRIEF,
      description: rawText || MOCK_GENERATED_BRIEF.description,
      title: rawText.substring(0, 20) + "..." || "New Task"
    };
  }
};
