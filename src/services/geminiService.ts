import { GoogleGenerativeAI } from "@google/generative-ai";
import { MagicBriefResult, TaskType, Priority } from "../models";

// Initialize Gemini
// Note: In Vite, we use import.meta.env, not process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const generateStructuredBrief = async (rawText: string): Promise<MagicBriefResult> => {
  // If no API key is present, throw error immediately to trigger UI fallback/error handling
  if (!apiKey) {
    console.warn("Missing VITE_GEMINI_API_KEY in .env");
    throw new Error("API Key missing. Please configure VITE_GEMINI_API_KEY.");
  }

  try {
    // Use specific model version to avoid 404s on aliases
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Construct a strong system prompt to enforce JSON structure
    const prompt = `
      You are an expert Project Manager AI. 
      Your goal is to extract structured data from the following unstructured design request:
      
      "${rawText}"

      Return a valid JSON object matching this TypeScript interface exactly. Do NOT return Markdown code blocks, just the raw JSON string.
      
      Interface:
      {
        title: string; // concise summary
        requester: string; // extract name or department. If unknown, infer from context or use "Client".
        description: string; // cleaned up requirements
        sprintPoints: number; // estimate effort (1, 2, 3, 5, 8). 1=simple text change, 3=social post, 5=landing page, 8=complex app.
        type: "${Object.values(TaskType).join('" | "')}"; // map to closest category
        priority: "${Object.values(Priority).join('" | "')}"; // infer from urgency words like "ASAP", "Urgent", "Tomorrow" -> Critical/High.
        referenceLinks: string[]; // extract any URLs found
      }
      
      Constraints:
      - If Priority is unclear, default to "Normal".
      - If Type is unclear, default to "Other".
      - Be concise in the title.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up if Gemini wraps it in ```json ... ```
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanedText) as MagicBriefResult;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process with AI. Check your API Key or try again.");
  }
};