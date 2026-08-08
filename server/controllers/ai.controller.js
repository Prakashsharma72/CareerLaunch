import { callGemini } from "../ai/geminiClient.js";

/**
 * AI CHAT CONTROLLER — powered by Gemini
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const reply = await callGemini([
      {
        role:    "system",
        content: "You are a helpful career assistant for students and freshers. Give clear, practical, concise advice.",
      },
      { role: "user", content: message },
    ]);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chatWithAI error:", err.message);
    return res.status(err.status || 500).json({
      message: err.message || "AI service error",
      code:    err.code,
    });
  }
};
