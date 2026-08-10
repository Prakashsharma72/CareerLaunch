import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../redux/authSlice";

import { loginUser, registerUser, verifyOtpApi, resendOtpApi } from "../services/authService";

/**
 * Custom Auth Hook
 * Wraps Redux + API logic into reusable functions.
 *
 * Registration flow (two-step):
 *   1. register(userData)  → sends OTP to email, returns { email, otpSent: true }
 *   2. verifyOtp(email, otp) → verifies OTP, dispatches loginSuccess, returns { user, token }
 */
const useAuth = () => {
  const dispatch = useDispatch();

  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [localLoading, setLocalLoading] = useState(false);

  /* ── LOGIN ─────────────────────────────────────────────────────────────── */
  const login = async (email, password) => {
    dispatch(loginStart());
    setLocalLoading(true);
    try {
      const res  = await loginUser({ email, password });
      const data = res.data;
      localStorage.setItem("token", data.token);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      dispatch(loginFailure(msg));
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  /* ── REGISTER (step 1 — sends OTP) ────────────────────────────────────── */
  const register = async (userData) => {
    setLocalLoading(true);
    try {
      const res = await registerUser(userData);
      // Returns { message, email, otpSent: true } — no JWT yet
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  /* ── VERIFY OTP (step 2 — completes registration) ─────────────────────── */
  const verifyOtp = async (email, otp) => {
    dispatch(loginStart());
    setLocalLoading(true);
    try {
      const res  = await verifyOtpApi({ email, otp });
      const data = res.data;
      localStorage.setItem("token", data.token);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Verification failed";
      dispatch(loginFailure(msg));
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  /* ── RESEND OTP ────────────────────────────────────────────────────────── */
  const resendOtp = async (email) => {
    setLocalLoading(true);
    try {
      const res = await resendOtpApi({ email });
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  /* ── LOGOUT ────────────────────────────────────────────────────────────── */
  const logoutUser = () => {
    localStorage.removeItem("token");
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    localLoading,

    login,
    register,
    verifyOtp,
    resendOtp,
    logoutUser,
  };
};

export default useAuth;
