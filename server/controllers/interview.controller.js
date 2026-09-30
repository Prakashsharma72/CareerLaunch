import { callGemini }       from "../ai/geminiClient.js";
import { SchemaType }       from "@google/generative-ai";
import { recordGeminiInterviewFailure, recordUserActivity } from "../services/notification.service.js";
import InterviewSession    from "../models/interviewSession.model.js";
import InterviewQuestion   from "../models/interviewQuestion.model.js";
import {
  interviewSystemPrompt,
  interviewReportPrompt,
} from "../ai/prompts.js";

/* ── helpers ── */
function safeParseJSON(raw) {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;

  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch { /* Try the JSON object embedded in a short model preamble. */ }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch { return null; }
}

// Single alias so all callers stay the same
const callAI = callGemini;

const feedbackSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING, enum: ["feedback"] },
    score: { type: SchemaType.INTEGER },
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    idealAnswer: { type: SchemaType.STRING },
    tip: { type: SchemaType.STRING },
    nextQuestion: {
      type: SchemaType.OBJECT,
      properties: {
        number: { type: SchemaType.INTEGER },
        category: { type: SchemaType.STRING, enum: ["technical", "behavioral", "conceptual"] },
        text: { type: SchemaType.STRING },
      },
      required: ["number", "category", "text"],
    },
  },
  required: ["type", "score", "strengths", "weaknesses", "idealAnswer", "tip"],
};

const questionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING, enum: ["question"] },
    number: { type: SchemaType.INTEGER },
    category: { type: SchemaType.STRING, enum: ["technical", "behavioral", "conceptual"] },
    text: { type: SchemaType.STRING },
  },
  required: ["type", "number", "category", "text"],
};

const finalFeedbackSchema = {
  type: SchemaType.OBJECT,
  properties: Object.fromEntries(Object.entries(feedbackSchema.properties).filter(([key]) => key !== "nextQuestion")),
  required: feedbackSchema.required,
};

function validString(value) { return typeof value === "string" && value.trim().length > 0; }
function validStringArray(value) { return Array.isArray(value) && value.every(validString); }
function validateFeedback(value, { requireNextQuestion = false } = {}) {
  if (!value || value.type !== "feedback") return { valid: false, reason: "wrong_type" };
  if (!Number.isInteger(value.score) || value.score < 1 || value.score > 10) return { valid: false, reason: "invalid_score" };
  if (!validStringArray(value.strengths) || !validStringArray(value.weaknesses)) return { valid: false, reason: "invalid_strengths_or_weaknesses" };
  if (!validString(value.idealAnswer) || !validString(value.tip)) return { valid: false, reason: "missing_feedback_text" };
  if (requireNextQuestion && (!value.nextQuestion || !Number.isInteger(value.nextQuestion.number) || !validString(value.nextQuestion.category) || !validString(value.nextQuestion.text))) return { valid: false, reason: "invalid_next_question" };
  return { valid: true };
}

function logAIValidation(reason, raw) {
  const size = typeof raw === "string" ? raw.length : 0;
  console.warn(`[interview] AI response validation failed: ${reason}; responseLength=${size}`);
}

function invalidFeedbackResponse(validation, raw) {
  logAIValidation(validation.reason, raw);
  const code = validation.reason === "wrong_type" || validation.reason === "invalid_json"
    ? "AI_INVALID_JSON"
    : "AI_INVALID_FEEDBACK";
  return { message: "The interview AI returned an invalid feedback response. Please retry.", code };
}

/* ════════════════════════════════════════════
   POST /api/interview/start
   Body: { role, difficulty }
   Creates a session, asks the first question.
════════════════════════════════════════════ */
export const startInterview = async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    const userId = req.user.id;

    if (!role || !difficulty) {
      return res.status(400).json({ message: "role and difficulty are required" });
    }

    // Ask GPT for question #1
    const systemMsg = interviewSystemPrompt(role, difficulty);
    const raw = await callAI([
      { role: "system", content: systemMsg },
      { role: "user",   content: "Start the interview. Ask the first question." },
    ], { responseSchema: questionSchema });

    const parsed = safeParseJSON(raw);
    if (!parsed || parsed.type !== "question" || !validString(parsed.text)) {
      logAIValidation("invalid_initial_question", raw);
      return res.status(502).json({ message: "The interview AI returned an invalid first question. Please try again.", code: "AI_INVALID_QUESTION" });
    }

    // Only create history after Gemini has produced a usable first question.
    const session = await InterviewSession.create({
      userId,
      role,
      difficulty,
      status: "active",
      totalQuestions: 12,
    });

    // Persist question record
    const questionRecord = await InterviewQuestion.create({
      sessionId:      session.id,
      questionNumber: 1,
      category:       parsed.category || "technical",
      question:       parsed.text,
    });

    recordUserActivity(req.user, {
      eventKey: `mock-interview-start:${session.id}`,
      type: "mock_interview",
      title: "Mock interview started",
      message: `${req.user.name || "A user"} started a ${difficulty} interview for ${role}.`,
      metadata: { action: "interview_start", sessionId: session.id, role, difficulty },
    }).catch(error => console.error("[interview] activity notification failed:", error.message));

    return res.status(201).json({
      session: {
        id:         session.id,
        role:       session.role,
        difficulty: session.difficulty,
        totalQuestions: session.totalQuestions,
      },
      question: {
        id:       questionRecord.id,
        number:   parsed.number,
        category: parsed.category,
        text:     parsed.text,
      },
    });
  } catch (err) {
    recordGeminiInterviewFailure(err, { operation: "start" }).catch(notificationError => console.error("[interview] admin alert failed:", notificationError.message));
    console.error("startInterview error:", err.message);
    return res.status(err.status || 500).json({
      message: err.message || "Failed to start interview",
      code: err.code || "INTERNAL_ERROR",
    });
  }
};

/* ════════════════════════════════════════════
   POST /api/interview/:sessionId/answer
   Body: { questionId, answer }
   Sends answer → gets feedback + next question.
════════════════════════════════════════════ */
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.user.id;

    if (!questionId || !String(answer || "").trim()) {
      return res.status(400).json({ message: "questionId and answer are required" });
    }

    const session = await InterviewSession.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session already completed" });
    }

    const question = await InterviewQuestion.findOne({
      where: { id: questionId, sessionId },
    });
    if (!question) return res.status(404).json({ message: "Question not found" });

    // A retry after an ambiguous network failure must replay the persisted result,
    // rather than charge Gemini or create a second question.
    if (question.userAnswer && question.feedback) {
      const savedFeedback = safeParseJSON(question.feedback);
      const savedValidation = validateFeedback(savedFeedback);
      if (savedValidation.valid) {
        const savedNext = await InterviewQuestion.findOne({
          where: { sessionId, questionNumber: question.questionNumber + 1 },
        });
        return res.status(200).json({
          feedback: {
            score: savedFeedback.score,
            strengths: savedFeedback.strengths,
            weaknesses: savedFeedback.weaknesses,
            idealAnswer: savedFeedback.idealAnswer,
            tip: savedFeedback.tip,
          },
          nextQuestion: savedNext ? {
            id: savedNext.id,
            number: savedNext.questionNumber,
            category: savedNext.category,
            text: savedNext.question,
          } : null,
          sessionProgress: {
            answered: session.answeredQuestions,
            total: session.totalQuestions,
            isLast: !savedNext,
          },
        });
      }
    }

    // Fetch all prior Q&A for context
    const prevQs = await InterviewQuestion.findAll({
      where: { sessionId },
      order: [["questionNumber", "ASC"]],
    });

    // Build conversation history for GPT
    const systemMsg = interviewSystemPrompt(session.role, session.difficulty);
    const history = [];
    for (const q of prevQs) {
      history.push({ role: "assistant", content: JSON.stringify({ type: "question", number: q.questionNumber, category: q.category, text: q.question }) });
      if (q.userAnswer) {
        history.push({ role: "user", content: q.userAnswer });
        if (q.feedback) {
          history.push({ role: "assistant", content: q.feedback });
        }
      }
    }
    // Append current answer
    history.push({ role: "user", content: answer });

    const isLastQuestion = question.questionNumber >= session.totalQuestions;

    if (!isLastQuestion) {
      // Ask for feedback + next question
      const raw = await callAI([
        { role: "system", content: systemMsg },
        ...history,
      ], { responseSchema: feedbackSchema });

      let parsed = safeParseJSON(raw);
      let parsedRaw = raw;
      let validation = validateFeedback(parsed, { requireNextQuestion: true });
      if (!validation.valid && validation.reason !== "invalid_next_question") {
        const retryRaw = await callAI([
          { role: "system", content: `${systemMsg}\nReturn one valid JSON object with type=feedback and a required nextQuestion object. Do not include markdown or commentary.` },
          ...history,
        ], { responseSchema: feedbackSchema });
        parsed = safeParseJSON(retryRaw);
        parsedRaw = retryRaw;
        validation = validateFeedback(parsed, { requireNextQuestion: true });
      }
      if (!validation.valid && validation.reason !== "invalid_next_question") {
        return res.status(502).json(invalidFeedbackResponse(validation, parsedRaw));
      }

      // Persist answer + feedback
      await question.update({
        userAnswer: answer,
        feedback:   JSON.stringify(parsed),
        score:      parsed.score,
      });

      // Persist next question
      const nextQ = parsed.nextQuestion?.text
        ? parsed.nextQuestion
        : {
            number: question.questionNumber + 1,
            category: "technical",
            text: `For the ${session.role} role, how would you approach debugging a difficult production issue?`,
          };
      const nextRecord = await InterviewQuestion.create({
        sessionId:      session.id,
        questionNumber: nextQ.number || question.questionNumber + 1,
        category:       nextQ.category || "technical",
        question:       nextQ.text,
      });

      // Update session answered count
      await session.update({
        answeredQuestions: session.answeredQuestions + 1,
      });

      return res.status(200).json({
        feedback: {
          score:       parsed.score,
          strengths:   parsed.strengths,
          weaknesses:  parsed.weaknesses,
          idealAnswer: parsed.idealAnswer,
          tip:         parsed.tip,
        },
        nextQuestion: {
          id:       nextRecord.id,
          number:   nextQ.number || question.questionNumber + 1,
          category: nextQ.category,
          text:     nextQ.text,
        },
        sessionProgress: {
          answered:  session.answeredQuestions + 1,
          total:     session.totalQuestions,
          isLast:    false,
        },
      });
    } else {
      // Last question — get feedback only (no nextQuestion)
      const raw = await callAI([
        { role: "system", content: systemMsg },
        ...history,
        { role: "user", content: "This was the last answer. Provide feedback only (no nextQuestion field)." },
      ], { responseSchema: finalFeedbackSchema });

      const parsed = safeParseJSON(raw);
      const validation = parsed ? validateFeedback(parsed) : { valid: false, reason: "invalid_json" };
      if (!validation.valid) {
        return res.status(502).json(invalidFeedbackResponse(validation, raw));
      }

      await question.update({
        userAnswer: answer,
        feedback:   JSON.stringify(parsed),
        score:      parsed.score,
      });
      await session.update({ answeredQuestions: session.answeredQuestions + 1 });

      return res.status(200).json({
        feedback: {
          score:       parsed?.score,
          strengths:   parsed?.strengths,
          weaknesses:  parsed?.weaknesses,
          idealAnswer: parsed?.idealAnswer,
          tip:         parsed?.tip,
        },
        nextQuestion: null,
        sessionProgress: {
          answered: session.answeredQuestions + 1,
          total:    session.totalQuestions,
          isLast:   true,
        },
      });
    }
  } catch (err) {
    recordGeminiInterviewFailure(err, { operation: "answer" }).catch(notificationError => console.error("[interview] admin alert failed:", notificationError.message));
    console.error("submitAnswer error:", err.message);
    return res.status(err.status || 500).json({ message: err.message || "Failed to submit answer", code: err.code });
  }
};

/* ════════════════════════════════════════════
   POST /api/interview/:sessionId/skip
   Skips current question, returns next one.
════════════════════════════════════════════ */
export const skipQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId } = req.body;
    const userId = req.user.id;

    if (!questionId) {
      return res.status(400).json({ message: "questionId is required" });
    }

    const session = await InterviewSession.findOne({ where: { id: sessionId, userId } });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const question = await InterviewQuestion.findOne({ where: { id: questionId, sessionId } });
    if (!question) return res.status(404).json({ message: "Question not found" });

    await question.update({ skipped: true });

    const nextNumber = question.questionNumber + 1;
    if (nextNumber > session.totalQuestions) {
      return res.status(200).json({ skipped: true, nextQuestion: null, isLast: true });
    }

    // Generate next question from AI
    const systemMsg = interviewSystemPrompt(session.role, session.difficulty);
    const raw = await callAI([
      { role: "system", content: systemMsg },
      { role: "user",   content: `Skip question ${question.questionNumber}. Ask question number ${nextNumber}.` },
    ], { responseSchema: questionSchema });

    const parsed = safeParseJSON(raw);
    const text = parsed?.text || parsed?.nextQuestion?.text || `Question ${nextNumber} for ${session.role}`;
    const category = parsed?.category || parsed?.nextQuestion?.category || "technical";

    const nextRecord = await InterviewQuestion.create({
      sessionId:      session.id,
      questionNumber: nextNumber,
      category,
      question:       text,
    });

    return res.status(200).json({
      skipped: true,
      nextQuestion: {
        id:       nextRecord.id,
        number:   nextNumber,
        category,
        text,
      },
      isLast: nextNumber >= session.totalQuestions,
    });
  } catch (err) {
    console.error("skipQuestion error:", err.message);
    return res.status(err.status || 500).json({ message: err.message || "Failed to skip question", code: err.code });
  }
};

/* ════════════════════════════════════════════
   POST /api/interview/:sessionId/end
   Generates final AI report and saves it.
════════════════════════════════════════════ */
export const endInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({ where: { id: sessionId, userId } });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const questions = await InterviewQuestion.findAll({
      where: { sessionId },
      order: [["questionNumber", "ASC"]],
    });

    // Build Q&A summary for the report prompt
    const qaSummary = questions
      .filter((q) => q.userAnswer)
      .map((q) => {
        const fb = q.feedback ? safeParseJSON(q.feedback) : null;
        return `Q${q.questionNumber} [${q.category}]: ${q.question}\nAnswer: ${q.userAnswer}\nScore: ${q.score ?? "N/A"}/10${fb?.idealAnswer ? `\nIdeal: ${fb.idealAnswer}` : ""}`;
      })
      .join("\n\n");

    // Calculate rough overall score from saved scores
    const scored = questions.filter((q) => q.score !== null && q.score !== undefined);
    const avgScore = scored.length
      ? scored.reduce((s, q) => s + parseFloat(q.score), 0) / scored.length
      : 0;

    // Generate AI report
    const reportRaw = await callAI([
      { role: "system", content: "You are a senior technical interviewer writing a performance report. Always respond with valid JSON only." },
      { role: "user",   content: interviewReportPrompt(session.role, session.difficulty, qaSummary) },
    ]);

    const report = safeParseJSON(reportRaw) ?? {
      overallScore: parseFloat(avgScore.toFixed(1)),
      grade: avgScore >= 9 ? "A+" : avgScore >= 8 ? "A" : avgScore >= 7 ? "B+" : avgScore >= 6 ? "B" : avgScore >= 5 ? "C" : "D",
      jobReady: avgScore >= 6,
      summary: "Interview completed.",
      strengths: [],
      weaknesses: [],
      improvementSuggestions: [],
      recommendedResources: [],
      nextSteps: [],
    };

    await session.update({
      status:       "completed",
      overallScore: report.overallScore ?? avgScore,
      report:       JSON.stringify(report),
      answeredQuestions: scored.length,
    });

    recordUserActivity(req.user, {
      eventKey: `mock-interview-completed:${session.id}`,
      type: "mock_interview",
      title: "Mock interview completed",
      message: `${req.user.name || "A user"} completed an interview for ${session.role}.`,
      metadata: { action: "interview_complete", sessionId: session.id, role: session.role, score: report.overallScore ?? avgScore },
    }).catch(error => console.error("[interview] activity notification failed:", error.message));

    return res.status(200).json({ report, session: { id: session.id, role: session.role, difficulty: session.difficulty } });
  } catch (err) {
    recordGeminiInterviewFailure(err, { operation: "end" }).catch(notificationError => console.error("[interview] admin alert failed:", notificationError.message));
    console.error("endInterview error:", err.message);
    return res.status(err.status || 500).json({ message: err.message || "Failed to generate report", code: err.code });
  }
};

/* ════════════════════════════════════════════
   GET /api/interview/history
   Returns all completed sessions for the user.
════════════════════════════════════════════ */
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await InterviewSession.findAll({
      where: { userId },
      order: [["id", "DESC"]],
    });

    const result = sessions.map((s) => ({
      id:               s.id,
      role:             s.role,
      difficulty:       s.difficulty,
      status:           s.status,
      overallScore:     s.overallScore,
      answeredQuestions:s.answeredQuestions,
      totalQuestions:   s.totalQuestions,
      createdAt:        s.createdAt,
      report:           s.report ? safeParseJSON(s.report) : null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("getInterviewHistory error:", err.message);
    return res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
};

/* ════════════════════════════════════════════
   GET /api/interview/:sessionId
   Returns a single session with all questions.
════════════════════════════════════════════ */
export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({ where: { id: sessionId, userId } });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const questions = await InterviewQuestion.findAll({
      where: { sessionId },
      order: [["questionNumber", "ASC"]],
    });

    return res.status(200).json({
      session: {
        id:               session.id,
        role:             session.role,
        difficulty:       session.difficulty,
        status:           session.status,
        overallScore:     session.overallScore,
        answeredQuestions:session.answeredQuestions,
        totalQuestions:   session.totalQuestions,
        createdAt:        session.createdAt,
        report:           session.report ? safeParseJSON(session.report) : null,
      },
      questions: questions.map((q) => ({
        id:             q.id,
        questionNumber: q.questionNumber,
        category:       q.category,
        question:       q.question,
        userAnswer:     q.userAnswer,
        feedback:       q.feedback ? safeParseJSON(q.feedback) : null,
        score:          q.score,
        skipped:        q.skipped,
      })),
    });
  } catch (err) {
    console.error("getSessionById error:", err.message);
    return res.status(500).json({ message: "Failed to fetch session", error: err.message });
  }
};

export { safeParseJSON, validateFeedback };
