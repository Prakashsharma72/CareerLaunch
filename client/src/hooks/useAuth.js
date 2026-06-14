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
    try {
      dispatch(loginStart());
      setLocalLoading(true);

      const res = await loginUser({ email, password });

      const data = res.data;

      // store token locally
      localStorage.setItem("token", data.token);

      dispatch(
        loginSuccess({
          user: data.user,
          token: data.token,
        })
      );

      setLocalLoading(false);
      return data;
    } catch (err) {
      setLocalLoading(false);
      dispatch(
        loginFailure(
          err?.response?.data?.message || "Login failed"
        )
      );
    }
  };

  /**
   * REGISTER USER
   */
  const register = async (userData) => {
    try {
      dispatch(loginStart());
      setLocalLoading(true);

      const res = await registerUser(userData);

      const data = res.data;

      localStorage.setItem("token", data.token);

      dispatch(
        loginSuccess({
          user: data.user,
          token: data.token,
        })
      );

      setLocalLoading(false);
      return data;
    } catch (err) {
      setLocalLoading(false);
      dispatch(
        loginFailure(
          err?.response?.data?.message || "Registration failed"
        )
      );
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