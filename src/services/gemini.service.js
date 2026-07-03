import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/ApiError.js';

export const callGeminiApi = async (promptText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "Gemini API key is missing from environment variables");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting if Gemini still included it despite the prompt
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const parsedJson = JSON.parse(text);
    return {
      parsed: parsedJson,
      raw: text
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.status === 404 || error.message.includes('404')) {
      throw new ApiError(400, "Invalid Gemini API Key or Model not found. Ensure your key starts with 'AIzaSy' or 'AQ.Ab' and is from Google AI Studio.");
    }
    if (error.status === 403 || error.status === 401 || error.message.includes('API key')) {
      throw new ApiError(401, "Unauthorized: Invalid Gemini API Key.");
    }
    
    if (error instanceof SyntaxError) {
      throw new ApiError(502, "AI returned malformed JSON that could not be parsed.");
    }
    throw new ApiError(502, "Failed to communicate with AI provider. " + error.message);
  }
};
