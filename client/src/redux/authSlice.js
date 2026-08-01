import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getValidToken } from "../utils/jwt";

/* ─────────────────────────────────────────────────────────────────────────
   Async thunks
   These are the ONLY places that touch localStorage / network.
───────────────────────────────────────────────────────────────────────── */

/**
 * Called on every app start (main.jsx).
 * If a valid JWT is in localStorage, fetch the latest profile from MySQL
 * so the in-memory user object is never stale.
 */
export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { rejectWithValue }) => {
    const token = getValidToken();
    if (!token) return rejectWithValue("no_token");

    try {
      // Dynamic import avoids circular dependency with store
      const { default: api } = await import("../services/api");
      const { data } = await api.get("/users/profile");
      return { user: data, token };
    } catch {
      // Token is invalid server-side — clear it
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue("invalid_token");
    }
  }
);

/**
 * Re-fetch the user profile from MySQL and update Redux state.
 * Call after a successful profile update.
 */
export const refreshProfile = createAsyncThunk(
  "auth/refreshProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { default: api } = await import("../services/api");
      const { data } = await api.get("/users/profile");
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to refresh profile");
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   Slice
───────────────────────────────────────────────────────────────────────── */

const initialState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  loading:         false,       // login / register in-progress
  bootstrapping:   true,        // app-start check in-progress
  error:           null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called by Login / Register pages after a successful API response. */
    loginSuccess(state, action) {
      state.loading        = false;
      state.error          = null;
      state.isAuthenticated = true;
      state.user           = action.payload.user;
      state.token          = action.payload.token;
      // Persist token so bootstrapAuth can verify it on next load
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user",  JSON.stringify(action.payload.user));
    },

    loginStart(state) {
      state.loading = true;
      state.error   = null;
    },

    loginFailure(state, action) {
      state.loading = false;
      state.error   = action.payload;
    },

    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      state.bootstrapping   = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    /** Kept for legacy callers — now a no-op; bootstrapAuth replaces it. */
    restoreAuth() {},
  },

  extraReducers(builder) {
    /* ── bootstrapAuth ── */
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapping   = false;
        state.isAuthenticated = true;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        // Keep localStorage in sync with the freshest profile
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapping   = false;
        state.isAuthenticated = false;
        state.user            = null;
        state.token           = null;
      });

    /* ── refreshProfile ── */
    builder
      .addCase(refreshProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, restoreAuth } =
  authSlice.actions;

export default authSlice.reducer;
