import axios from "axios";
import store from "../redux/store";
import { logout } from "../redux/authSlice";

/**
 * Central Axios instance — all API calls go through here.
 */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Request interceptor — attach JWT on every outbound request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
    if (error?.response?.status === 401) {
      // Dispatch logout (clears Redux + localStorage)
      store.dispatch(logout());
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
