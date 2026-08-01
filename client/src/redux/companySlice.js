import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companies: [],
  savedCompanies: [],
  loading: false,
  savedLoading: false,
  error: null,
  savedError: null,
  // last search params so we can show them in the UI
  lastKeyword: "",
  lastCity: "",
};

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    // ── Search ──────────────────────────────────────────────
    searchStart: (state, action) => {
      state.loading = true;
      state.error = null;
      state.lastKeyword = action.payload?.keyword ?? state.lastKeyword;
      state.lastCity    = action.payload?.city    ?? state.lastCity;
    },
    searchSuccess: (state, action) => {
      state.loading   = false;
      state.companies = action.payload;
    },
    searchFailure: (state, action) => {
      state.loading = false;
      state.error   = action.payload;
    },

    // ── Saved companies ──────────────────────────────────────
    fetchSavedStart: (state) => {
      state.savedLoading = true;
      state.savedError   = null;
    },
    fetchSavedSuccess: (state, action) => {
      state.savedLoading  = false;
      state.savedCompanies = action.payload;
    },
    fetchSavedFailure: (state, action) => {
      state.savedLoading = false;
      state.savedError   = action.payload;
    },

    // Optimistically add a saved company
    addSaved: (state, action) => {
      // action.payload = full company object with savedId
      const exists = state.savedCompanies.some(
        (s) => s.id === action.payload.id
      );
      if (!exists) state.savedCompanies.unshift(action.payload);
    },

    // Optimistically remove a saved company
    removeSaved: (state, action) => {
      // action.payload = savedId
      state.savedCompanies = state.savedCompanies.filter(
        (s) => s.savedId !== action.payload
      );
    },

    clearCompanies: (state) => {
      state.companies  = [];
      state.error      = null;
      state.lastKeyword = "";
      state.lastCity    = "";
    },
  },
});

export const {
  searchStart,
  searchSuccess,
  searchFailure,
  fetchSavedStart,
  fetchSavedSuccess,
  fetchSavedFailure,
  addSaved,
  removeSaved,
  clearCompanies,
} = companySlice.actions;

export default companySlice.reducer;
