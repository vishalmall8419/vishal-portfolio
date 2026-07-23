import { createContext, useCallback, useEffect, useState } from "react";
import { publicApi, resolveAssetUrl } from "../lib/publicApi";

export const ThemeContext = createContext();

const DEFAULT_FAVICON = "/favicon.svg";

// Pushes the admin-controlled color tokens onto :root so every component
// already styled with var(--primary) / var(--secondary) picks them up
// automatically -- no per-component wiring needed.
const applyThemeVars = (siteTheme) => {
  if (!siteTheme) return;
  const root = document.documentElement;
  if (siteTheme.primaryColor) root.style.setProperty("--primary", siteTheme.primaryColor);
  if (siteTheme.secondaryColor) root.style.setProperty("--secondary", siteTheme.secondaryColor);
  if (siteTheme.accentColor) root.style.setProperty("--accent", siteTheme.accentColor);
  root.style.setProperty(
    "--vm-animations",
    siteTheme.animationsEnabled === false ? "paused" : "running"
  );
};

// Swaps the <link rel="icon"> href. Cache-busted with a query string so the
// browser can't keep serving a stale favicon after a re-upload (the file on
// disk gets a new name each upload anyway, but this also covers any
// browser-level favicon cache tied to the old URL momentarily overlapping).
const applyFavicon = (faviconPath) => {
  const href = faviconPath ? `${resolveAssetUrl(faviconPath)}?v=${Date.now()}` : DEFAULT_FAVICON;
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
};

function ThemeProvider({ children }) {
  // Manual light/dark toggle -- unchanged behavior, still user-overridable
  // and persisted, but now seeded from the admin's default mode once it
  // loads (only if the user hasn't already chosen one this browser).
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Global site data -- the ONE source of truth for logo/favicon/avatar/
  // resume/social links (Settings) and colors/mode (Theme). Every public
  // and admin-preview component should read from here, not from local
  // hardcoded assets or component-level fetches.
  const [siteSettings, setSiteSettings] = useState(null);
  const [siteTheme, setSiteTheme] = useState(null);
  const [siteDataLoading, setSiteDataLoading] = useState(true);

  const refreshSiteData = useCallback(async () => {
    const [settingsRes, themeRes] = await Promise.allSettled([
      publicApi.settings(),
      publicApi.theme(),
    ]);

    if (settingsRes.status === "fulfilled") {
      const settings = settingsRes.value?.data?.data ?? null;
      setSiteSettings(settings);
      applyFavicon(settings?.favicon);
    }

    if (themeRes.status === "fulfilled") {
      const nextTheme = themeRes.value?.data?.data ?? null;
      setSiteTheme(nextTheme);
      applyThemeVars(nextTheme);
      // Only auto-apply the admin's default mode if this browser hasn't set
      // its own preference yet -- manual toggle always wins after that.
      if (nextTheme?.mode && nextTheme.mode !== "system" && !localStorage.getItem("theme")) {
        setTheme(nextTheme.mode);
      }
    }

    return { settings: settingsRes, theme: themeRes };
  }, []);

  useEffect(() => {
    refreshSiteData().finally(() => setSiteDataLoading(false));
  }, [refreshSiteData]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        siteSettings,
        siteTheme,
        siteDataLoading,
        refreshSiteData,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
