import { Link } from "react-router-dom";
import "./Achievements.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

// Fallback only used if the Achievements CMS resource is empty/unreachable.
const FALLBACK_ACHIEVEMENTS = [
  { id: 1, value: "20+", title: "Projects Completed", description: "Developed multiple frontend, backend and full stack applications." },
  { id: 2, value: "15+", title: "Technologies", description: "Hands-on experience with modern web development technologies." },
  { id: 3, value: "100%", title: "Learning Mindset", description: "Continuously learning new tools, frameworks and best practices." },
  { id: 4, value: "2028", title: "B.Tech Target", description: "Pursuing Bachelor's degree while building production-ready projects." },
];

function Achievements() {
  const { data, loading } = usePublicData(() => publicApi.achievements(), []);
  const achievements =
    !loading && Array.isArray(data) && data.length
      ? data.slice(0, 4).map((row) => ({
          id: row.id,
          slug: row.slug,
          // Achievement rows don't carry a standalone "stat" number, so the
          // year of the achievement fills the same highlighted-value slot.
          value: row.date ? new Date(row.date).getFullYear() : "",
          title: row.title,
          description: row.briefDescription || row.description,
        }))
      : FALLBACK_ACHIEVEMENTS;

  return (
    <section className="vm-achievements">

      <div className="vm-achievements-container">

        <SectionTitle
          subtitle="ACHIEVEMENTS"
          title="My"
          highlight=" Milestones"
          description="Some highlights from my learning journey and development career."
          align="center"
        />

        <div className="vm-achievements-grid">

          {achievements.map((item) => (

            <GlassCard
              key={item.id}
              className="vm-achievement-card"
            >

              <h2>{item.value}</h2>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              {item.slug && (
                <Link to={`/achievements/${item.slug}`} className="vm-achievement-link">
                  View Details →
                </Link>
              )}

            </GlassCard>

          ))}

        </div>

        <div className="vm-achievements-cta">
          <Link to="/achievements" className="vm-achievements-view-all">
            View All Achievements
          </Link>
        </div>

      </div>

    </section>
  );
}

export default Achievements;
