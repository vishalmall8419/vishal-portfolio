import "./Experience.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

// Used only if the API call fails or the admin hasn't added any experience
// entries yet, so the section never renders empty.
const FALLBACK_EXPERIENCES = [
  {
    year: "2025 - Present",
    title: "B.Tech Student",
    company: "Shrinath Ji Institute for Technical Education",
    description:
      "Learning advanced software engineering, data structures, algorithms and full stack development while building real-world projects.",
  },
  {
    year: "2024 - Present",
    title: "Java Full Stack Developer",
    company: "Self Learning Journey",
    description:
      "Building scalable applications using Java, Spring Boot, React, Node.js and MySQL while continuously improving problem solving skills.",
  },
  {
    year: "2023 - 2024",
    title: "Frontend Development",
    company: "Personal Projects",
    description:
      "Created responsive websites, dashboards and UI components using HTML, CSS, JavaScript, Bootstrap, Tailwind CSS and React.",
  },
  {
    year: "2022 - 2023",
    title: "Programming Foundation",
    company: "Learning Phase",
    description:
      "Started programming journey with Java, SQL, OOP, Data Structures and developed multiple academic projects.",
  },
];

function Experience() {
  const { data: rows, loading } = usePublicData(() => publicApi.experience(), []);

  const experiences =
    Array.isArray(rows) && rows.length > 0
      ? rows
      : loading
      ? []
      : FALLBACK_EXPERIENCES;

  return (
    <section className="vm-experience">

      <div className="vm-experience-container">

        <SectionTitle
          subtitle="EXPERIENCE"
          title="Learning"
          highlight=" Journey"
          description="Every project and technology has helped me become a better developer."
          align="center"
        />

        <div className="vm-experience-list">

          {experiences.map((item, index) => (

            <GlassCard
              key={item.id ?? index}
              className="vm-experience-card"
            >

              <span className="vm-exp-year">
                {item.year}
              </span>

              <h3>{item.title}</h3>

              <h4>{item.company}</h4>

              <p>{item.description}</p>

            </GlassCard>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Experience;
