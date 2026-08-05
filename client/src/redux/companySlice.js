import { createSlice, createSelector } from "@reduxjs/toolkit";

/**
 * companySlice
 *
 * Tracks:
 *  - companies[]        search results
 *  - savedCompanies[]   user's bookmarked companies
 *  - pagination         page / pageSize / total
 *  - loading / error
 *  - meta               source, fallbackUsed, googleWarning
 *  - lastSearch         keyword + city so the UI can restore them
 */

const PAGE_SIZE = 9;

const initialState = {
  // ── Search results ───────────────────────────────────────────
  companies:    [],
  loading:      false,
  error:        null,          // structured error object or plain string

  // ── Pagination ───────────────────────────────────────────────
  page:         1,
  pageSize:     PAGE_SIZE,
  total:        0,

  // ── Data source meta ─────────────────────────────────────────
  source:       null,          // "google_v2" | "openstreetmap" | "nominatim" | "cache"
  fallbackUsed: false,
  googleWarning: null,         // { error, message, suggestion } | null

  // ── Saved companies ──────────────────────────────────────────
  savedCompanies: [],
  savedLoading:   false,
  savedError:     null,

  // ── Last search ──────────────────────────────────────────────
  lastKeyword: "",
  lastCity:    "",
};

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    /* ── Search lifecycle ──────────────────────────────────── */
    searchStart(state, action) {
      state.loading       = true;
      state.error         = null;
      state.companies     = [];
      state.total         = 0;
      state.page          = 1;
      state.source        = null;
      state.fallbackUsed  = false;
      state.googleWarning = null;
      if (action.payload?.keyword !== undefined) state.lastKeyword = action.payload.keyword;
      if (action.payload?.city    !== undefined) state.lastCity    = action.payload.city;
    },

    searchSuccess(state, action) {
      const { companies = [], total, source, fallbackUsed, googleWarning } = action.payload;
      state.loading       = false;
      state.error         = null;
      state.companies     = companies;
      state.total         = total ?? companies.length;
      state.page          = 1;
      state.source        = source         ?? null;
      state.fallbackUsed  = fallbackUsed   ?? false;
      state.googleWarning = googleWarning  ?? null;
    },

    searchFailure(state, action) {
      state.loading   = false;
      state.companies = [];
      state.total     = 0;
      // action.payload can be a structured object or a plain string
      state.error = action.payload;
    },

    setPage(state, action) {
      state.page = action.payload;
    },

    clearSearch(state) {
      state.companies     = [];
      state.error         = null;
      state.total         = 0;
      state.page          = 1;
      state.source        = null;
      state.fallbackUsed  = false;
      state.googleWarning = null;
      state.lastKeyword   = "";
      state.lastCity      = "";
    },

    /* ── Saved companies ────────────────────────────────────── */
    fetchSavedStart(state) {
      state.savedLoading = true;
      state.savedError   = null;
    },

    fetchSavedSuccess(state, action) {
      state.savedLoading   = false;
      state.savedCompanies = action.payload;
    },

    fetchSavedFailure(state, action) {
      state.savedLoading = false;
      state.savedError   = action.payload;
    },

    addSaved(state, action) {
      const exists = state.savedCompanies.some((s) => s.id === action.payload.id);
      if (!exists) state.savedCompanies.unshift(action.payload);
    },

    removeSaved(state, action) {
      // action.payload = savedId
      state.savedCompanies = state.savedCompanies.filter(
        (s) => s.savedId !== action.payload
      );
    },
  },
});

export const {
  searchStart,
  searchSuccess,
  searchFailure,
  setPage,
  clearSearch,
  fetchSavedStart,
  fetchSavedSuccess,
  fetchSavedFailure,
  addSaved,
  removeSaved,
} = companySlice.actions;

/* ── Selectors ──────────────────────────────────────────────────────────── */

const selectCompaniesState = (state) => state.companies;

/** Slice of the companies array for the current page — memoized */
export const selectPagedCompanies = createSelector(
  selectCompaniesState,
  ({ companies, page, pageSize }) =>
    companies.slice((page - 1) * pageSize, page * pageSize)
);

/** Total number of pages — memoized */
export const selectTotalPages = createSelector(
  selectCompaniesState,
  ({ companies, pageSize }) => Math.ceil(companies.length / pageSize)
);

/** Set of saved company IDs — memoized (new Set only when savedCompanies changes) */
export const selectSavedIds = createSelector(
  (state) => state.companies.savedCompanies,
  (savedCompanies) => new Set(savedCompanies.map((s) => s.id))
);

export default companySlice.reducer;
