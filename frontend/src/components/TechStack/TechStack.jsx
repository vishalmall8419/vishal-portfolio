import "./TechStack.css";
import usePublicData from "../../hooks/usePublicData";
import { publicApi } from "../../lib/publicApi";
import IconRenderer from "../IconRenderer/IconRenderer";

// Used only if the API call fails or the admin hasn't added any skills yet,
// so the section never renders empty.
const FALLBACK_TECHNOLOGIES = [
  { name: "HTML5", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Tailwind CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
  { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "GitHub", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
  { name: "Postman", logo: "https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" },
  { name: "GSAP", logo: "https://gsap.com/community/uploads/monthly_2020_03/tweenmax.thumb.png.c849c5b56c6752e3f2276b82ee702625.png" },
];

function TechStack() {
  const { data: skills, loading } = usePublicData(() => publicApi.skills(), []);

  const technologies =
    Array.isArray(skills) && skills.length > 0
      ? skills.map((skill) => ({
          name: skill.name,
          icon: skill.icon || null,
        }))
      : loading
      ? []
      : FALLBACK_TECHNOLOGIES.map((tech) => ({ name: tech.name, icon: tech.logo }));

  return (
    <section className="vm-tech-stack">
      <div className="vm-tech-container">

        <h2 className="vm-tech-title">
          Technology Stack
        </h2>

        <div className="vm-tech-grid">

          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="vm-tech-card"
            >
              <IconRenderer
                value={tech.icon}
                alt={tech.name}
                className="vm-tech-logo"
                fallback={
                  <span className="vm-tech-logo vm-tech-logo-fallback" aria-hidden="true">
                    {tech.name.charAt(0)}
                  </span>
                }
              />

              <h3>{tech.name}</h3>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default TechStack;
