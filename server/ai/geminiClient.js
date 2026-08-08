/**
 * geminiClient.js
 *
 * Wraps @google/generative-ai so the rest of the codebase
 * calls a single function: callGemini(messages)
 *
 * messages format matches OpenAI convention:
 *   [{ role: "system"|"user"|"assistant", content: "..." }, ...]
 *
 * Gemini uses:
 *   - system_instruction  (system message)
 *   - contents[]          (alternating user / model turns)
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.0-flash";

function getClient() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    const e = new Error("GEMINI_API_KEY is not set in .env");
    e.code = "NO_API_KEY"; e.status = 503;
    throw e;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Convert OpenAI-style messages array to Gemini format.
 * Returns { systemInstruction, contents }
 */
function convertMessages(messages) {
  let systemInstruction = "";
  const contents = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction += (systemInstruction ? "\n" : "") + msg.content;
    } else if (msg.role === "user") {
      contents.push({ role: "user", parts: [{ text: msg.content }] });
    } else if (msg.role === "assistant") {
      contents.push({ role: "model", parts: [{ text: msg.content }] });
    }
  }

  return { systemInstruction, contents };
}

/**
 * callGemini(messages)
 * Accepts the same OpenAI messages array format.
 * Returns the model's text response as a string.
 */
export async function callGemini(messages) {
  try {
    const genAI = getClient();
    const { systemInstruction, contents } = convertMessages(messages);

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      ...(systemInstruction && { systemInstruction }),
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 2048,
        // Force JSON output to avoid markdown fences
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent({ contents });
    const text   = result.response.text();
    return text;

  } catch (err) {
    // Map Gemini error codes to friendly messages
    const status  = err.status  || err.response?.status;
    const message = err.message || "";

    if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
      const e = new Error("Gemini API key is invalid. Check GEMINI_API_KEY in .env");
      e.code = "INVALID_KEY"; e.status = 503;
      throw e;
    }
    if (status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
      const e = new Error("Gemini rate limit reached. Please wait and try again.");
      e.code = "RATE_LIMIT"; e.status = 429;
      throw e;
    }
    if (message.includes("PERMISSION_DENIED") || message.includes("billing")) {
      const e = new Error("Gemini API access denied. Ensure the Generative Language API is enabled in Google Cloud Console.");
      e.code = "PERMISSION_DENIED"; e.status = 503;
      throw e;
    }
    // Re-throw with original message
    throw err;
  }
}
