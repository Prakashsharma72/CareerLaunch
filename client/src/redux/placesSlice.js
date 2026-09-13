/**
 * placesSlice.js
 *
 * Shared Redux store for both the Jobs page and Companies page.
 * Both pages read from the same companies array — changes in one
 * automatically reflect in the other (single source of truth).
 *
 * State shape:
 *   location         — detected or entered user location
 *   companies        — full list from Google Places API
 *   filters          — active search/filter values
 *   ui               — loading, error, pagination state
 *   savedMap         — { [placeId]: savedId } for bookmark state
 */
import { createSlice, createSelector } from "@reduxjs/toolkit";
import { persistFilters, readPersistedFilters } from "../utils/cache";

const persistedFilters = readPersistedFilters()?.data || {};

const initialState = {
  /* ── Location ───────────────────────────────────────────────── */
  location: {
    status:   "idle",      // "idle" | "requesting" | "granted" | "denied" | "error"
    lat:      null,
    lon:      null,
    city:     null,        // short city name: "Pune"
    fullCity: null,        // "Pune, Maharashtra, India"
    error:    null,
  },

  /* ── Data ───────────────────────────────────────────────────── */
  companies:    [],        // full result from Google Places
  total:        0,
  source:       null,      // "google_places" | "cache" | "no_location"

  /* ── Filters ────────────────────────────────────────────────── */
  filters: {
    search:    persistedFilters.search || "",         // free text — client-side name filter
    city:      persistedFilters.city || "",         // manual city override
    minRating: persistedFilters.minRating ?? 0,
    maxRadius: persistedFilters.maxRadius ?? 50,         // km — used for GPS radius chip
    openNow:   persistedFilters.openNow ?? false,
    keyword:   persistedFilters.keyword || "software company",  // sent to Google Places API
    batchIndex: persistedFilters.batchIndex ?? 0,                   // related provider-query batch already loaded
  },

  /* ── UI state ───────────────────────────────────────────────── */
  loading:      false,
  error:        null,
  page:         1,
  pageSize:     12,

  /* ── Saved companies { placeId: savedId } ───────────────────── */
  savedMap:     {},
};

/* ══════════════════════════════════════════════════════════════════
   SLICE
══════════════════════════════════════════════════════════════════ */
const placesSlice = createSlice({
  name: "places",
  initialState,
  reducers: {

    /* ── Location ──────────────────────────────────────────────── */
    setLocationStatus(state, action) {
      state.location.status = action.payload;
    },
    setLocationGranted(state, action) {
      const { lat, lon, city, fullCity } = action.payload;
      state.location = { status: "granted", lat, lon, city: city || null, fullCity: fullCity || null, error: null };
    },
    setLocationDenied(state, action) {
      state.location = { ...state.location, status: "denied", error: action.payload || "Location denied" };
    },
    setLocationError(state, action) {
      state.location = { ...state.location, status: "error", error: action.payload };
    },
    setManualCity(state, action) {
      // User typed a city manually — keep any coords if available
      state.location.city     = action.payload;
      state.location.fullCity = action.payload;
      if (state.location.status === "denied" || state.location.status === "idle") {
        state.location.status = "manual";
      }
      state.filters.city = action.payload;
    },

    /* ── Fetch lifecycle ───────────────────────────────────────── */
    fetchStart(state) {
      state.loading   = true;
      state.error     = null;
      state.page      = 1;
    },
    appendFetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    appendFetchSuccess(state, action) {
      const incoming = action.payload.companies || [];
      const existingIds = new Set(state.companies.map(company => company.placeId));
      state.companies = [...state.companies, ...incoming.filter(company => !existingIds.has(company.placeId))]
        .sort((first, second) => (first.distanceKm ?? Infinity) - (second.distanceKm ?? Infinity));
      state.total = state.companies.length;
      state.loading = false;
      state.source = action.payload.source || state.source;
    },
    fetchSuccess(state, action) {
      const { companies = [], total, source } = action.payload;
      state.loading   = false;
      state.error     = null;
      state.companies = companies;
      state.total     = total ?? companies.length;
      state.source    = source ?? null;
      state.page      = 1;
    },
    fetchFailure(state, action) {
      state.loading   = false;
      state.error     = action.payload;
    },

    /* ── Filters ───────────────────────────────────────────────── */
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page    = 1;
      persistFilters(state.filters);
    },
    resetFilters(state) {
      state.filters = { ...initialState.filters };
      state.page    = 1;
    },

    /* ── Pagination ────────────────────────────────────────────── */
    setPage(state, action) {
      state.page = action.payload;
    },

    /* ── Saved map ─────────────────────────────────────────────── */
    setSavedMap(state, action) {
      state.savedMap = action.payload;
    },
    addSaved(state, action) {
      const { placeId, savedId } = action.payload;
      state.savedMap[placeId] = savedId;
    },
    removeSaved(state, action) {
      delete state.savedMap[action.payload];
    },

    /* ── Reset all ─────────────────────────────────────────────── */
    resetAll() {
      return { ...initialState };
    },
  },
});

export const {
  setLocationStatus,
  setLocationGranted,
  setLocationDenied,
  setLocationError,
  setManualCity,
  fetchStart,
  appendFetchStart,
  appendFetchSuccess,
  fetchSuccess,
  fetchFailure,
  setFilter,
  resetFilters,
  setPage,
  setSavedMap,
  addSaved,
  removeSaved,
  resetAll,
} = placesSlice.actions;

/* ══════════════════════════════════════════════════════════════════
   SELECTORS
══════════════════════════════════════════════════════════════════ */
const selectPlaces = (s) => s.places;

/** Apply filters to the full companies array (memoised) */
export const selectFilteredCompanies = createSelector(
  selectPlaces,
  ({ companies, filters }) => {
    let list = companies;

    // Free-text search
    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.companyName?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)     ||
        c.industry?.toLowerCase().includes(q)
      );
    }

    // Min rating
    if (filters.minRating > 0) {
      list = list.filter(c => c.rating != null && c.rating >= filters.minRating);
    }

    // Open now
    if (filters.openNow) {
      list = list.filter(c => c.isOpenNow === true);
    }

    // Max radius (distanceKm must exist — GPS searches have it)
    if (filters.maxRadius < 50) {
      list = list.filter(c => c.distanceKm == null || c.distanceKm <= filters.maxRadius);
    }

    return list;
  }
);

/** Current page slice of filtered results */
export const selectPagedCompanies = createSelector(
  [selectFilteredCompanies, (s) => s.places.page, (s) => s.places.pageSize],
  (filtered, page, pageSize) =>
    filtered.slice((page - 1) * pageSize, page * pageSize)
);

/** Total pages based on filtered count */
export const selectTotalPages = createSelector(
  [selectFilteredCompanies, (s) => s.places.pageSize],
  (filtered, pageSize) => Math.max(1, Math.ceil(filtered.length / pageSize))
);

export default placesSlice.reducer;
