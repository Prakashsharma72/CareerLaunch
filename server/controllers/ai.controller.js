import axios from "axios";

/**
 * AI CHAT CONTROLLER (OpenAI or GPT API)
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful career assistant for students and freshers.",
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

    res.status(200).json({
      reply: response.data.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({
      message: "AI service error",
      error: error.message,
    });
  }
};