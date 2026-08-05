import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../redux/authSlice";

import { loginUser, registerUser } from "../services/authService";

/**
 * Custom Auth Hook
 * Wraps Redux + API logic into reusable functions
 */
const useAuth = () => {
  const dispatch = useDispatch();

  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [localLoading, setLocalLoading] = useState(false);

  /**
   * LOGIN USER
   */
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
      throw err;          // ← re-throw so Login.jsx can show the error
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * REGISTER USER
   */
  const register = async (userData) => {
    dispatch(loginStart());
    setLocalLoading(true);
    try {
      const res  = await registerUser(userData);
      const data = res.data;
      localStorage.setItem("token", data.token);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      dispatch(loginFailure(msg));
      throw err;          // ← re-throw so Register.jsx can show the error
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * LOGOUT USER
   */
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
    logoutUser,
  };
};

export default useAuth;