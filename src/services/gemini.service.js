import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/ApiError.js';

const DEFAULT_MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getModelCandidates = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const configuredFallbacks = process.env.GEMINI_FALLBACK_MODELS
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean) || [];

  return [...new Set([configuredModel, ...configuredFallbacks, ...DEFAULT_MODEL_CANDIDATES].filter(Boolean))];
};

const isTransientGeminiError = (error) => {
  const status = error?.status;
  const message = error?.message || '';

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /high demand|overload|temporarily unavailable|service unavailable|rate limit|fetch failed|network error/i.test(message)
  );
};

export const callGeminiApi = async (promptText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "Gemini API key is missing from environment variables");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelCandidates = getModelCandidates();
    const maxRetries = Number(process.env.GEMINI_MAX_RETRIES || 2);
    let lastError;
    let text;
    let usedModel;

    for (const modelName of modelCandidates) {
      const model = genAI.getGenerativeModel({ model: modelName });

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          const result = await model.generateContent(promptText);
          const response = await result.response;
          text = response.text();
          usedModel = modelName;
          lastError = null;
          break;
        } catch (error) {
          lastError = error;

          if (!isTransientGeminiError(error)) {
            throw error;
          }

          const delayMs = 750 * 2 ** attempt;
          console.warn(`Gemini model ${modelName} failed with a transient error. Attempt ${attempt + 1}/${maxRetries + 1}.`);
          await sleep(delayMs);
        }
      }

      if (!lastError) {
        break;
      }
    }

    if (lastError) {
      throw lastError;
    }

    // Clean up potential markdown formatting if Gemini still included it despite the prompt
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const parsedJson = JSON.parse(text);
    return {
      parsed: parsedJson,
      raw: text,
      model: usedModel
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.status === 404 || error.message?.includes('404')) {
      throw new ApiError(400, "Invalid Gemini API Key or Model not found. Ensure your key starts with 'AIzaSy' or 'AQ.Ab' and is from Google AI Studio.");
    }
    if (error.status === 403 || error.status === 401 || error.message?.includes('API key')) {
      throw new ApiError(401, "Unauthorized: Invalid Gemini API Key.");
    }
    if (isTransientGeminiError(error)) {
      throw new ApiError(503, "Gemini is temporarily overloaded. Retried with fallback models, but the provider is still unavailable. Please try again in a few minutes.");
    }

    if (error instanceof SyntaxError) {
      throw new ApiError(502, "AI returned malformed JSON that could not be parsed.");
    }
    throw new ApiError(502, "Failed to communicate with AI provider. " + error.message);
  }
};
