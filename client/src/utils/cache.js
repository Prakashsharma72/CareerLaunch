const CACHE_PREFIX = "careerlaunch-ui";
const SCHEMA_VERSION = 1;

const DEFAULTS = {
  companies: { freshnessMs: 5 * 60 * 1000, staleMs: 2 * 60 * 60 * 1000, maxBytes: 180000 },
  jobs: { freshnessMs: 5 * 60 * 1000, staleMs: 2 * 60 * 60 * 1000, maxBytes: 180000 },
  resources: { freshnessMs: 10 * 60 * 1000, staleMs: 3 * 60 * 60 * 1000, maxBytes: 180000 },
  roadmaps: { freshnessMs: 10 * 60 * 1000, staleMs: 3 * 60 * 60 * 1000, maxBytes: 180000 },
  filters: { freshnessMs: 24 * 60 * 60 * 1000, staleMs: 24 * 60 * 60 * 1000, maxBytes: 5000 },
};

const pendingRequests = new Map();
const readUserScope = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "guest";
    const parsed = JSON.parse(raw);
    return parsed?.id ? `user:${parsed.id}` : "guest";
  } catch {
    return "guest";
  }
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const stableStringify = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

export const CACHE_KEYS = {
  resources: "resources",
  roadmaps: "roadmaps",
  companies: "companies",
  jobs: "jobs",
  filters: "filters",
};

export const getCacheKey = (scope, params = {}) => {
  const normalized = stableStringify(params);
  return `${CACHE_PREFIX}:${scope}:${SCHEMA_VERSION}:${normalized}`;
};

export const normalizeCompanyList = (companies = []) => {
  if (!Array.isArray(companies)) return [];

  return companies.map((company) => ({
    placeId: company.placeId ?? company.externalCompanyId ?? company.id ?? null,
    companyName: company.companyName || company.name || null,
    website: company.website || null,
    careerUrl: company.careerUrl || company.careerPage || null,
    careerVerified: Boolean(company.careerVerified || company.careerUrl || company.careerPage),
    mapsUrl: company.mapsUrl || null,
    logo: company.logo || null,
    address: company.address || null,
    shortAddress: company.shortAddress || null,
    phone: company.phone || null,
    rating: company.rating ?? null,
    reviewCount: company.reviewCount ?? null,
    distance: company.distance || company.distanceText || null,
    distanceKm: company.distanceKm ?? null,
    industry: company.industry || null,
    types: company.types || [],
    isOpenNow: company.isOpenNow ?? null,
    openingHours: company.openingHours || null,
    latitude: company.latitude ?? null,
    longitude: company.longitude ?? null,
    city: company.city || null,
    keyword: company.keyword || null,
  }));
};

export const normalizeResourceList = (resources = []) => {
  if (!Array.isArray(resources)) return [];

  return resources.map((resource) => ({
    id: resource.id ?? null,
    title: resource.title || null,
    description: resource.description || null,
    category: resource.category || null,
    resourceType: resource.resourceType || resource.type || null,
    difficulty: resource.difficulty || resource.level || null,
    link: resource.link || resource.fileUrl || null,
    fileUrl: resource.fileUrl || null,
    fileName: resource.fileName || null,
    estimatedTime: resource.estimatedTime || resource.duration || resource.time || null,
    tags: Array.isArray(resource.tags) ? resource.tags : [],
    coverUrl: resource.coverUrl || null,
    createdAt: resource.createdAt || null,
    updatedAt: resource.updatedAt || null,
    status: resource.status || null,
  }));
};

export const normalizeRoadmapList = (roadmaps = []) => {
  if (!Array.isArray(roadmaps)) return [];

  return roadmaps.map((roadmap) => ({
    id: roadmap.id ?? null,
    title: roadmap.title || null,
    shortDescription: roadmap.shortDescription || roadmap.roadmapContent || null,
    category: roadmap.category || null,
    difficulty: roadmap.difficulty || null,
    durationWeeks: roadmap.durationWeeks ?? null,
    publishedAt: roadmap.publishedAt || null,
    status: roadmap.status || null,
    steps: Array.isArray(roadmap.steps) ? roadmap.steps.map((step) => ({
      id: step.id ?? null,
      title: step.title || null,
      description: step.description || null,
      estimatedTime: step.estimatedTime || null,
      topics: Array.isArray(step.topics) ? step.topics : [],
      resources: Array.isArray(step.resources) ? step.resources.map((resource) => ({
        id: resource.id ?? null,
        label: resource.label || null,
        type: resource.type || null,
        sourceType: resource.sourceType || null,
        url: resource.url || resource.link || null,
        resourceType: resource.resourceType || null,
      })) : [],
    })) : [],
  }));
};

const pruneEntries = (scope) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || !key.startsWith(`${CACHE_PREFIX}:${scope}:`)) continue;
      keys.push(key);
    }

    const entries = keys
      .map((key) => {
        try {
          const raw = storage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));

    while (entries.length > 25) {
      const oldest = entries.shift();
      if (oldest?.cacheKey) storage.removeItem(oldest.cacheKey);
    }
  } catch {
    // Ignore pruning failures; cache is best-effort.
  }
};

export const readBrowserCache = (key, scope) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw);

    if (entry.schemaVersion !== SCHEMA_VERSION || entry.scope !== scope || entry.userScope !== readUserScope()) {
      storage.removeItem(key);
      return null;
    }

    const now = Date.now();
    if (entry.expiresAt && now > entry.expiresAt) {
      storage.removeItem(key);
      return null;
    }

    return {
      data: entry.data,
      stale: Boolean(entry.staleAt && now > entry.staleAt),
      updatedAt: entry.updatedAt,
      staleAt: entry.staleAt,
      expiresAt: entry.expiresAt,
    };
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      // ignore
    }
    return null;
  }
};

export const writeBrowserCache = (key, data, scope, overrides = {}) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const config = { ...DEFAULTS[scope], ...overrides };
    const payload = JSON.stringify(data);
    const now = Date.now();

    if (payload.length > config.maxBytes) {
      return null;
    }

    const entry = {
      cacheKey: key,
      schemaVersion: SCHEMA_VERSION,
      scope,
      userScope: readUserScope(),
      data,
      updatedAt: now,
      staleAt: now + (config.freshnessMs || 0),
      expiresAt: now + (config.staleMs || 0),
    };

    storage.setItem(key, JSON.stringify(entry));
    pruneEntries(scope);
    return entry;
  } catch {
    return null;
  }
};

export const clearBrowserCache = (scope = null) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    const removeKeys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) continue;
      if (scope && key.startsWith(`${CACHE_PREFIX}:${scope}:`)) {
        removeKeys.push(key);
      }
      if (!scope && key.startsWith(`${CACHE_PREFIX}:`)) {
        removeKeys.push(key);
      }
    }

    removeKeys.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore cleanup failures.
  }
};

export const fetchWithCache = async ({
  key,
  scope,
  request,
  freshnessMs,
  staleMs,
  maxBytes,
}) => {
  const config = {
    freshnessMs,
    staleMs,
    maxBytes,
  };

  const cached = readBrowserCache(key, scope);
  const inFlight = pendingRequests.get(key);

  if (cached && !cached.stale) {
    return {
      data: cached.data,
      cacheHit: true,
      stale: false,
      refreshPromise: inFlight || Promise.resolve(cached.data),
    };
  }

  if (cached && cached.stale) {
    if (!inFlight) {
      const refreshPromise = request()
        .then((response) => {
          const payload = response?.data ?? response;
          writeBrowserCache(key, payload, scope, config);
          pendingRequests.delete(key);
          return response;
        })
        .catch((error) => {
          pendingRequests.delete(key);
          throw error;
        });

      pendingRequests.set(key, refreshPromise);
    }

    return {
      data: cached.data,
      cacheHit: true,
      stale: true,
      refreshPromise: pendingRequests.get(key),
    };
  }

  if (inFlight) {
    return {
      data: null,
      cacheHit: false,
      stale: false,
      refreshPromise: inFlight,
    };
  }

  const refreshPromise = request()
    .then((response) => {
      const payload = response?.data ?? response;
      writeBrowserCache(key, payload, scope, config);
      pendingRequests.delete(key);
      return response;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, refreshPromise);

  return {
    data: null,
    cacheHit: false,
    stale: false,
    refreshPromise,
  };
};

export const readPersistedFilters = () => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${CACHE_PREFIX}:${CACHE_KEYS.filters}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const persistFilters = (filters) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      `${CACHE_PREFIX}:${CACHE_KEYS.filters}`,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        userScope: readUserScope(),
        data: filters,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Ignore persistence failures.
  }
};
