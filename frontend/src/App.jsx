import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import Maintenance from "./pages/Maintenance/Maintenance";

import Cursor from "./components/Cursor/Cursor";
import Loader from "./components/Loader/Loader";
import PremiumFab from "./components/PremiumFab/PremiumFab";
import useTheme from "./hooks/useTheme";
import { normalizeUrl, resolveAssetUrl } from "./lib/publicApi";

// Injects a single site-wide JSON-LD <script> describing the site owner as
// a schema.org Person. Sourced entirely from the admin-editable Settings
// record (name/role/email/phone/social links/avatar) so it never goes
// stale independently of the rest of the site — no hardcoded structured
// data anywhere.
function useStructuredData(siteSettings, isAdminRoute) {
  useEffect(() => {
    if (isAdminRoute || !siteSettings) return undefined;

    const sameAs = Object.values(siteSettings.socialLinks || {})
      .filter(Boolean)
      .map((url) => normalizeUrl(url))
      .filter(Boolean);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteSettings.name || "Vishal Mall",
      jobTitle: siteSettings.role || "Full Stack Developer",
      url: window.location.origin,
      ...(siteSettings.email && { email: siteSettings.email }),
      ...(siteSettings.phone && { telephone: siteSettings.phone }),
      ...(resolveAssetUrl(siteSettings.avatar) && { image: resolveAssetUrl(siteSettings.avatar) }),
      ...(sameAs.length > 0 && { sameAs }),
    };

    let script = document.getElementById("vm-jsonld-person");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "vm-jsonld-person";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      script?.remove();
    };
  }, [siteSettings, isAdminRoute]);
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { siteSettings } = useTheme();

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  useStructuredData(siteSettings, isAdminRoute);

  useEffect(() => {
    // Don't lock scrolling on admin pages
    if (isAdminRoute) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAdminRoute]);

  const handleLoaderComplete = () => {
    document.body.style.overflow = "auto";
    setIsLoading(false);
  };

  if (isAdminRoute) {
    return (
      <>
        <Cursor />
        <AppRoutes />
      </>
    );
  }

  // Maintenance Mode (public site only -- /admin stays reachable so the
  // admin can log in and switch this back off from Settings > Maintenance)
  if (siteSettings?.maintenanceMode) {
    return (
      <>
        <Cursor />
        <Maintenance />
      </>
    );
  }

  return (
    <>
      <Cursor />

      {isLoading ? (
        <Loader onComplete={handleLoaderComplete} />
      ) : (
        <>
          <AppRoutes />
          <PremiumFab />
        </>
      )}
    </>
  );
}

export default App;