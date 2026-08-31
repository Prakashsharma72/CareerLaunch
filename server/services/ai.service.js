import Chat from "../models/chat.model.js";
import { callGemini } from "../ai/geminiClient.js";

/**
 * AI CHAT SERVICE — powered by Gemini
 */
export const chatWithAIService = async (userId, message) => {
  const reply = await callGemini([
    {
      role:    "system",
      content: "You are a career assistant helping students with jobs, resumes, and interviews. Give clear and practical advice.",
    },
    { role: "user", content: message },
  ]);

  // Save chat in DB
  await Chat.create({ userId, message, response: reply });

  return reply;
};
