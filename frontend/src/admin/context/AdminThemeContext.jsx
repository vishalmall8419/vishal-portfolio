import { createContext, useContext, useState, useEffect } from "react";

const AdminThemeContext = createContext(null);
const KEY = "admx_ui_mode";

export function AdminThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(KEY) || "dark");

  useEffect(() => {
    localStorage.setItem(KEY, mode);
    document.documentElement.setAttribute("data-admx-mode", mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <AdminThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used within AdminThemeProvider");
  return ctx;
};
