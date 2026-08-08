import { callGemini }       from "../ai/geminiClient.js";
import InterviewSession    from "../models/interviewSession.model.js";
import InterviewQuestion   from "../models/interviewQuestion.model.js";
import {
  interviewSystemPrompt,
  interviewReportPrompt,
} from "../ai/prompts.js";

/* ── helpers ── */
function safeParseJSON(raw) {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// Single alias so all callers stay the same
const callAI = callGemini;

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

    // Create session
    const session = await InterviewSession.create({
      userId,
      role,
      difficulty,
      status: "active",
      totalQuestions: 12,
    });

    // Ask GPT for question #1
    const systemMsg = interviewSystemPrompt(role, difficulty);
    const raw = await callAI([
      { role: "system", content: systemMsg },
      { role: "user",   content: "Start the interview. Ask the first question." },
    ]);

    const parsed = safeParseJSON(raw);
    if (!parsed || parsed.type !== "question") {
      return res.status(500).json({ message: "AI returned unexpected format", raw });
    }

    // Persist question record
    await InterviewQuestion.create({
      sessionId:      session.id,
      questionNumber: 1,
      category:       parsed.category || "technical",
      question:       parsed.text,
    });

    return res.status(201).json({
      session: {
        id:         session.id,
        role:       session.role,
        difficulty: session.difficulty,
        totalQuestions: session.totalQuestions,
      },
      question: {
        number:   parsed.number,
        category: parsed.category,
        text:     parsed.text,
      },
    });
  } catch (err) {
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
      ]);

      const parsed = safeParseJSON(raw);
      if (!parsed || parsed.type !== "feedback") {
        return res.status(500).json({ message: "AI returned unexpected format", raw });
      }

      // Persist answer + feedback
      await question.update({
        userAnswer: answer,
        feedback:   JSON.stringify(parsed),
        score:      parsed.score,
      });

      // Persist next question
      const nextQ = parsed.nextQuestion;
      const nextRecord = await InterviewQuestion.create({
        sessionId:      session.id,
        questionNumber: nextQ.number,
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
          number:   nextQ.number,
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
      ]);

      const parsed = safeParseJSON(raw);
      const score  = parsed?.score ?? 5;

      await question.update({
        userAnswer: answer,
        feedback:   JSON.stringify(parsed || {}),
        score,
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
    ]);

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

    return res.status(200).json({ report, session: { id: session.id, role: session.role, difficulty: session.difficulty } });
  } catch (err) {
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
