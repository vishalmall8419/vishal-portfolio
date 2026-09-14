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
  title: "React Frontend Developer",
  company: "Personal Projects",
  description:
    "Building modern and responsive web applications using React, JavaScript, HTML, CSS, Bootstrap and Tailwind CSS, with a strong focus on UI/UX, reusable components and responsive design.",
},

{
  year: "2024 - Present",
  title: "Frontend Development",
  company: "Self Learning",
  description:
    "Developing practical frontend skills through real-world projects, focusing on React, JavaScript, API integration, React Router, state management and modern UI development.",
},

{
  year: "2023 - 2024",
  title: "Web Developer",
  company: "Personal Projects",
  description:
    "Created responsive websites and interactive user interfaces using HTML, CSS, JavaScript, Bootstrap and Tailwind CSS while learning modern frontend development practices.",
},

{
  year: "2022 - 2023",
  title: "Programming & Web Development",
  company: "Self Learning",
  description:
    "Started my development journey by learning programming fundamentals, Java, SQL, OOP concepts, HTML, CSS and JavaScript and applying them through small practical projects.",
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
