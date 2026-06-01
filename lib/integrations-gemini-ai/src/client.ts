import { GoogleGenAI } from "@google/genai";

// Development defaults - can be overridden with environment variables
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "test-key-development";

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    apiVersion: "",
    baseUrl: baseUrl,
  },
});
