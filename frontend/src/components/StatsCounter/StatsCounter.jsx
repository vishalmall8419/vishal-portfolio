import { useEffect, useState } from "react";
import "./StatsCounter.css";
import usePublicData from "../../hooks/usePublicData";
import { publicApi } from "../../lib/publicApi";

const FALLBACK_STATS = {
  totalProjects: 20,
  technologies: 15,
  certifications: 5,
  achievements: 5,
  experience: 5,
  happyClients: 100,
};

function Counter({ end, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const safeEnd = Math.max(Number(end) || 0, 1);

    const duration = 2000;
    const step = Math.ceil(duration / safeEnd);

    const timer = setInterval(() => {
      start++;
      setCount(start);

      if (start >= safeEnd) {
        clearInterval(timer);
      }
    }, step);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="vm-counter">
      <h2>{count}+</h2>
      <span>{label}</span>
    </div>
  );
}

function StatsCounter() {
  const { data: settings } = usePublicData(() => publicApi.settings(), []);
  const stats = settings?.stats || FALLBACK_STATS;

  const items = [
    { key: "totalProjects", label: "Projects" },
    { key: "technologies", label: "Technologies" },
    { key: "certifications", label: "Certifications" },
    { key: "achievements", label: "Achievements" },
    { key: "experience", label: "Years Experience" },
    { key: "happyClients", label: "Happy Clients" },
  ];

  return (
    <section className="vm-stats-section">
      {items.map(({ key, label }) => {
        const value = stats[key] ?? FALLBACK_STATS[key];
        // Hide the card entirely if the admin-provided value is 0
        if (Number(value) === 0) return null;
        return <Counter key={key} end={value} label={label} />;
      })}
    </section>
  );
}

export default StatsCounter;
