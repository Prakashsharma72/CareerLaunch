import db from './config/db.js';
import './models/user.model.js';
import './models/job.model.js';
import './models/company.model.js';
import './models/savedCompany.model.js';
import './models/interviewSession.model.js';
import './models/interviewQuestion.model.js';
import './models/application.model.js';
import './models/roadmap.model.js';
import './models/resumeAnalysis.model.js';
import './models/savedJob.model.js';

await db.sync({ alter: true });

// List all tables
const [tables] = await db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log('Tables:', tables.map(r => r.name).join(', '));

// Try running the exact stats query
try {
  const [[stats]] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM applications    WHERE user_id = :uid) AS applied_jobs,
       (SELECT COUNT(*) FROM saved_jobs      WHERE user_id = :uid) AS saved_jobs,
       (SELECT COUNT(*) FROM saved_companies WHERE user_id = :uid) AS saved_companies,
       (SELECT COUNT(*) FROM interview_sessions WHERE user_id = :uid) AS interviews,
       (SELECT COUNT(*) FROM roadmaps        WHERE user_id = :uid) AS roadmaps,
       (SELECT ats_score FROM resume_analyses WHERE user_id = :uid
        ORDER BY created_at DESC LIMIT 1)                          AS resume_score`,
    { replacements: { uid: 1 } }
  );
  console.log('Stats query OK:', stats);
} catch (e) {
  console.error('Stats query FAILED:', e.message);
}

await db.close();
