import { createSlice } from "@reduxjs/toolkit";
import { getValidToken, decodeToken } from "../utils/jwt";

/* ── Rehydrate from localStorage on module load ── */
function loadPersistedAuth() {
  const token = getValidToken(); // returns null if missing/expired
  if (!token) return { user: null, token: null, isAuthenticated: false };

  // Try to restore user object saved alongside the token
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    // Fallback: pull basic fields from the JWT payload itself
    if (!user) {
      const payload = decodeToken(token);
      return {
        user: payload
          ? { id: payload.id ?? payload.sub, email: payload.email, role: payload.role, name: payload.name }
          : null,
        token,
        isAuthenticated: true,
      };
    }

    return { user, token, isAuthenticated: true };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

const persisted = loadPersistedAuth();

const initialState = {
  user:            persisted.user,
  token:           persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  loading:         false,
  error:           null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error   = null;
    },

    loginSuccess: (state, action) => {
      state.loading        = false;
      state.user           = action.payload.user;
      state.token          = action.payload.token;
      state.isAuthenticated = true;
      state.error          = null;
      // Persist user object so rehydration works without a network call
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error   = action.payload;
    },

    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    /**
     * restoreAuth — called from main.jsx on every app startup.
     * Re-validates the token and rehydrates state (handles tab restores,
     * token expiry between visits, etc.).
     */
    restoreAuth: (state) => {
      const { user, token, isAuthenticated } = loadPersistedAuth();
      state.user            = user;
      state.token           = token;
      state.isAuthenticated = isAuthenticated;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, restoreAuth } =
  authSlice.actions;

export default authSlice.reducer;
