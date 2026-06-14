import api from "./api";

/**
 * AI Chat / ChatGPT API
 */
export const sendMessageToAI = (message) => {
  return api.post("/ai/chat", {
    message,
  });
};

export const getAIHistory = () => {
  return api.get("/ai/history");
};

export const clearAIChat = () => {
  return api.delete("/ai/clear");
};