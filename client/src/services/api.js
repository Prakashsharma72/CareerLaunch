import axios from "axios";
import store from "../redux/store";
import { logout } from "../redux/authSlice";

/**
 * Central Axios instance — all API calls go through here.
 *
 * baseURL is read from the VITE_API_URL environment variable so that:
 *   - Local dev  → http://localhost:5000/api  (.env.development)
 *   - Production → https://<render-app>.onrender.com/api  (.env.production / Vercel env)
 *
 * NEVER hardcode localhost here — mobile browsers resolve localhost
 * to the phone itself, not the backend server.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,          // 30 s — Render cold-starts can be slow
  withCredentials: false,  // we use Bearer tokens, not cookies
});

/**
 * Request interceptor — attach JWT on every outbound request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Debug log in development only
    if (import.meta.env.DEV) {
      console.log(`[api] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — on 401 the token is invalid / expired on the
 * server side; clear local state and redirect to /login automatically.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[api] Error:", error?.response?.status, error?.response?.data);
    }

    if (error?.response?.status === 401) {
      store.dispatch(logout());
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
