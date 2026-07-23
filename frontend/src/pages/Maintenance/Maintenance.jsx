import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiLock, FiClock } from "react-icons/fi";
import useTheme from "../../hooks/useTheme";
import { resolveAssetUrl } from "../../lib/publicApi";
import "./Maintenance.css";

const DEFAULT_MESSAGE =
  "We're currently performing scheduled maintenance. We'll be back online shortly.";

// Ticks down to `target` (a Date), returning null once it's passed (or if
// no target was given), so the caller can just hide the countdown then.
function useCountdown(target) {
  const [remaining, setRemaining] = useState(() => (target ? target.getTime() - Date.now() : null));

  useEffect(() => {
    if (!target) return undefined;
    const id = setInterval(() => {
      setRemaining(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || remaining === null || remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function Maintenance() {
  const { siteSettings } = useTheme();
  const logoUrl = resolveAssetUrl(siteSettings?.logo);
  const siteName = siteSettings?.name || "Vishal Mall";
  const message = siteSettings?.maintenanceMessage || DEFAULT_MESSAGE;
  const splineUrl = siteSettings?.maintenanceSplineUrl || null;

  const endsAt = siteSettings?.maintenanceEndsAt ? new Date(siteSettings.maintenanceEndsAt) : null;
  const countdown = useCountdown(endsAt);

  return (
    <main className="maint-page">
      {splineUrl ? (
        <iframe
          className="maint-spline"
          src={splineUrl}
          title="Maintenance scene"
          frameBorder="0"
          loading="lazy"
        />
      ) : (
        <div className="maint-bg" aria-hidden="true">
          <span className="maint-blob maint-blob-a" />
          <span className="maint-blob maint-blob-b" />
          <span className="maint-blob maint-blob-c" />
          <span className="maint-grid" />
        </div>
      )}

      <div className="maint-content">
        {logoUrl && <img src={logoUrl} alt={siteName} className="maint-logo" />}

        <span className="maint-eyebrow">// under-maintenance</span>
        <h1 className="maint-title">
          We'll be <span>right back</span>.
        </h1>
        <p className="maint-message">{message}</p>

        {countdown && (
          <div className="maint-countdown" role="timer" aria-label="Time until we're back">
            {[
              ["Days", countdown.days],
              ["Hours", countdown.hours],
              ["Min", countdown.minutes],
              ["Sec", countdown.seconds],
            ].map(([label, value]) => (
              <div className="maint-countdown-unit" key={label}>
                <span className="maint-countdown-value">{String(value).padStart(2, "0")}</span>
                <span className="maint-countdown-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {!countdown && endsAt === null && (
          <div className="maint-eta">
            <FiClock /> Back online soon
          </div>
        )}

        <Link to="/admin/login" className="maint-admin-btn">
          <FiLock /> Admin Login
        </Link>
      </div>
    </main>
  );
}

export default Maintenance;
