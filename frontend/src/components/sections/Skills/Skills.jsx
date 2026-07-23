import "./Skills.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

// Fallback only used if the Skills CMS resource is empty/unreachable.
const FALLBACK_SKILLS = [
  { category: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS", "Bootstrap"] },
  { category: "Backend", items: ["Java", "JDBC", "Servlet", "JSP", "Spring Boot", "Node.js"] },
  { category: "Database", items: ["MySQL", "MongoDB", "Sequelize", "SQL"] },
  { category: "Tools", items: ["Git", "GitHub", "VS Code", "Postman", "Eclipse", "NetBeans"] },
];

// Skill rows come back flat ({ name, category, ... }); group them by
// category so the grid matches the original static shape.
function groupByCategory(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.name);
  });
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}

function Skills() {
  const { data, loading } = usePublicData(() => publicApi.skills(), []);
  const grouped = !loading && Array.isArray(data) && data.length ? groupByCategory(data) : FALLBACK_SKILLS;

  return (
    <section className="vm-skills">

      <div className="vm-skills-container">

        <SectionTitle
          subtitle="SKILLS"
          title="Technologies"
          highlight=" I Use"
          description="Technologies and tools I use to build modern, scalable and production-ready web applications."
          align="center"
        />

        <div className="vm-skills-grid">

          {grouped.map((skill) => (

            <GlassCard
              key={skill.category}
              className="vm-skill-card"
            >

              <h3>{skill.category}</h3>

              <div className="vm-skill-list">

                {skill.items.map((item) => (

                  <span
                    key={item}
                    className="vm-skill-chip"
                  >
                    {item}
                  </span>

                ))}

              </div>

            </GlassCard>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Skills;
