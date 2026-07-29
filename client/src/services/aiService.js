import api from "./api";

/* ─── General AI Chat ─── */
export const sendMessageToAI = (message) => api.post("/ai/chat", { message });
export const getAIHistory     = ()          => api.get("/ai/history");
export const clearAIChat      = ()          => api.delete("/ai/clear");

/* ─── Mock Interview ─── */

/** Start a new interview session — returns { session, question } */
export const startInterviewSession = (role, difficulty) =>
  api.post("/interview/start", { role, difficulty });

/** Submit an answer — returns { feedback, nextQuestion, sessionProgress } */
export const submitInterviewAnswer = (sessionId, questionId, answer) =>
  api.post(`/interview/${sessionId}/answer`, { questionId, answer });

/** Skip current question — returns { skipped, nextQuestion, isLast } */
export const skipInterviewQuestion = (sessionId, questionId) =>
  api.post(`/interview/${sessionId}/skip`, { questionId });

/** End session and generate full report — returns { report, session } */
export const endInterviewSession = (sessionId) =>
  api.post(`/interview/${sessionId}/end`);

/** Fetch all past sessions for the logged-in user */
export const getInterviewHistory = () =>
  api.get("/interview/history");

/** Fetch a single session with all questions */
export const getInterviewSession = (sessionId) =>
  api.get(`/interview/${sessionId}`);
