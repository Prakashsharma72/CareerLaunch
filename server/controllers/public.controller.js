import {
  getPublicSnapshot,
  publicSnapshotConfig,
} from "../services/publicSnapshot.service.js";

export const getPublicCompanies = async (req, res) => {
  return sendSnapshot("companies", req, res);
};

async function sendSnapshot(scope, req, res) {
  try {
    const snapshot = await getPublicSnapshot(scope, {
      force: req.query.refresh === "true",
    });

    return res.status(200).json({
      success: true,
      data: snapshot.data,
      updatedAt: snapshot.updatedAt,
      stale: snapshot.stale,
      freshnessMs: publicSnapshotConfig.FRESH_MS,
      maxStaleMs: publicSnapshotConfig.MAX_STALE_MS,
    });
  } catch (error) {
    console.error(`[public] ${scope} snapshot unavailable:`, error.message);
    return res.status(503).json({
      success: false,
      error: "PUBLIC_SNAPSHOT_UNAVAILABLE",
      reason: "Public data is temporarily unavailable.",
      retryable: true,
    });
  }
}
