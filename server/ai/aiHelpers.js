
/**
 * Format AI response cleanly
 */
export const formatAIResponse = (text) => {
  return text
    .replace(/\*\*/g, "") // remove markdown bold
    .trim();
};

/**
 * Build chat messages for OpenAI
 */
export const buildMessages = (systemPrompt, userMessage) => {
  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];
};

/**
 * Extract clean reply from OpenAI response
 */
export const extractAIReply = (response) => {
  return response?.data?.choices?.[0]?.message?.content || "";
};