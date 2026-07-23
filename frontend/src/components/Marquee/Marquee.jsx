import "./Marquee.css";
import usePublicData from "../../hooks/usePublicData";
import { publicApi } from "../../lib/publicApi";

// Used only if the API call fails or the admin hasn't added any skills yet,
// so the ticker never renders empty.
const FALLBACK_TECHS = [
  "React",
  "Java",
  "Spring Boot",
  "Node.js",
  "Express",
  "MySQL",
  "MongoDB",
  "Tailwind CSS",
  "GSAP",
  "Spline",
  "Git",
  "GitHub",
  "REST API",
  "JavaScript",
  "HTML5",
  "CSS3",
];

function Marquee() {
  const { data: skills, loading } = usePublicData(() => publicApi.skills(), []);

  const techs =
    Array.isArray(skills) && skills.length > 0
      ? skills.map((skill) => skill.name)
      : loading
      ? []
      : FALLBACK_TECHS;

  return (
    <section className="vm-marquee">

      <div className="vm-track">

        {[...techs, ...techs].map((item, index) => (
          <span key={index} className="vm-item">
            {item}
          </span>
        ))}

      </div>

    </section>
  );
}

export default Marquee;
