import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../api";
import { getToken, setToken, clearToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setAdmin(data.data);
    } catch (err) {
      clearToken();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Step 1: email + password. The backend now always responds with an OTP
  // challenge instead of a session — returns that challenge so the login
  // page can move to the "enter code" screen.
  const login = async ({ email, password }) => {
    const { data } = await authApi.login({ email, password });
    return data.data; // { otpRequired, otpToken, email, expiresIn }
  };

  // Step 2: the emailed code. Only this completes the session.
  const verifyOtp = async ({ otpToken, otp, rememberMe }) => {
    const { data } = await authApi.verifyOtp({ otpToken, otp });
    setToken(data.data.token, rememberMe);
    setAdmin(data.data.admin);
    return data.data.admin;
  };

  const resendOtp = async ({ otpToken }) => {
    const { data } = await authApi.resendOtp({ otpToken });
    return data.data; // { otpRequired, otpToken, email, expiresIn }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      /* proceed with local logout regardless */
    }
    clearToken();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        setAdmin,
        loading,
        login,
        verifyOtp,
        resendOtp,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
