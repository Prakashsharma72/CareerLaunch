import axios from "axios";
import Chat from "../models/chat.model.js";

/**
 * AI CHAT SERVICE
 */
export const chatWithAIService = async (userId, message) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career assistant helping students with jobs, resumes, and interviews.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const aiReply = response.data.choices[0].message.content;

  // Save chat in DB (SQL)
  await Chat.create({
    userId,
    message,
    response: aiReply,
  });

  return aiReply;
};