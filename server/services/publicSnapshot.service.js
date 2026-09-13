import { Op } from "sequelize";
import Company from "../models/company.model.js";
import PublicSnapshot from "../models/publicSnapshot.model.js";

const FRESH_MS = Number(process.env.PUBLIC_SNAPSHOT_FRESH_MS || 15 * 60 * 1000);
const MAX_STALE_MS = Number(process.env.PUBLIC_SNAPSHOT_MAX_STALE_MS || 24 * 60 * 60 * 1000);
const LIMIT = Math.min(Math.max(Number(process.env.PUBLIC_SNAPSHOT_LIMIT || 6), 1), 12);
const REFRESH_TIMEOUT_MS = Number(process.env.PUBLIC_SNAPSHOT_REFRESH_TIMEOUT_MS || 5000);
const PLACES_RETENTION_MS = Number(process.env.PUBLIC_PLACES_RETENTION_MS || 30 * 24 * 60 * 60 * 1000);
const refreshes = new Map();

const scopes = {
  companies: {
    key: "home_companies",
    load: async () => {
      const rows = await Company.findAll({
        where: {
          placeId: { [Op.ne]: null },
          updatedAt: { [Op.gte]: new Date(Date.now() - PLACES_RETENTION_MS) },
          [Op.or]: [
            { businessStatus: null },
            { businessStatus: { [Op.notIn]: ["CLOSED_PERMANENTLY", "CLOSED"] } },
          ],
        },
        order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
        limit: LIMIT,
      });
      return rows.map(row => {
        const value = row.toJSON();
        return {
          placeId: value.placeId,
          companyName: value.companyName,
          website: value.website,
          careerPage: value.careerPage,
          address: value.address,
          phone: value.phone,
          rating: value.rating,
          reviewCount: value.reviewCount,
          mapsUrl: value.mapsUrl,
          businessStatus: value.businessStatus,
          isOpenNow: value.isOpenNow,
          industry: value.industry,
          city: value.city,
          dataSource: "google_places",
          attribution: "Google Maps",
        };
      });
    },
  },
};

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Public snapshot refresh timed out")), REFRESH_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function refreshScope(scope) {
  const config = scopes[scope];
  if (!config) throw new Error(`Unknown public snapshot scope: ${scope}`);
  if (refreshes.has(scope)) return refreshes.get(scope);

  const refresh = withTimeout(config.load())
    .then(async payload => {
      const generatedAt = new Date();
      await PublicSnapshot.upsert({ scope: config.key, payload, generatedAt });
      return { payload, generatedAt };
    })
    .finally(() => refreshes.delete(scope));

  refreshes.set(scope, refresh);
  return refresh;
}

function formatSnapshot(row) {
  const generatedAt = row?.generatedAt ? new Date(row.generatedAt) : null;
  const ageMs = generatedAt ? Date.now() - generatedAt.getTime() : Infinity;
  return {
    data: Array.isArray(row?.payload) ? row.payload : [],
    updatedAt: generatedAt?.toISOString() || null,
    stale: ageMs > FRESH_MS,
    ageMs,
  };
}

export async function getPublicSnapshot(scope, { force = false } = {}) {
  const config = scopes[scope];
  if (!config) throw new Error(`Unknown public snapshot scope: ${scope}`);

  const row = await PublicSnapshot.findByPk(config.key);
  const snapshot = formatSnapshot(row);
  const usable = row && snapshot.ageMs <= MAX_STALE_MS;

  if (usable && !force && snapshot.data.length > 0) {
    if (snapshot.stale) refreshScope(scope).catch(error =>
      console.error(`[public-snapshot] ${scope} refresh failed:`, error.message)
    );
    return snapshot;
  }

  try {
    const refreshed = await refreshScope(scope);
    return {
      data: refreshed.payload,
      updatedAt: refreshed.generatedAt.toISOString(),
      stale: false,
      ageMs: 0,
    };
  } catch (error) {
    if (usable) return snapshot;
    throw error;
  }
}

export function refreshPublicSnapshot(scope) {
  return refreshScope(scope);
}

export async function invalidatePublicSnapshot(scope) {
  const config = scopes[scope];
  if (!config) return;
  await PublicSnapshot.update(
    { generatedAt: new Date(0) },
    { where: { scope: config.key } }
  );
}

export const publicSnapshotConfig = { FRESH_MS, MAX_STALE_MS, LIMIT, PLACES_RETENTION_MS };
