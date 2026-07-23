import "./Projects.css";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import Button from "../../ui/Button";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../../lib/publicApi";

// Fallback only used if the Projects CMS resource is empty/unreachable.
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "College Management System",
    category: "Java",
    description:
      "Complete college management system with student, faculty, attendance and result management.",
  },
  {
    id: 2,
    title: "E-Commerce Website",
    category: "Full Stack",
    description:
      "Modern shopping website with authentication, cart, payment and admin dashboard.",
  },
  {
    id: 3,
    title: "Student Productivity Portal",
    category: "JavaScript",
    description:
      "Interactive student portal with task manager, timer and productivity tools.",
  },
  {
    id: 4,
    title: "Portfolio Website",
    category: "React",
    description:
      "Premium personal portfolio with GSAP animations, CMS and responsive design.",
  },
];

function Projects() {
  const navigate = useNavigate();
  const { data, loading } = usePublicData(() => publicApi.projects(), []);
  const projects = !loading && Array.isArray(data) && data.length ? data : FALLBACK_PROJECTS;

  return (
    <section className="vm-projects">

      <div className="vm-projects-container">

        <SectionTitle
          subtitle="PROJECTS"
          title="Featured"
          highlight=" Projects"
          description="A selection of projects demonstrating my skills in frontend, backend and full stack development."
          align="center"
        />

        <div className="vm-project-grid">

          {projects.map((project) => (
            <GlassCard
              key={project.id}
              className="vm-project-card"
            >
              <div className="vm-project-image">
                {project.image ? (
                  <img src={resolveAssetUrl(project.image)} alt={project.title} />
                ) : (
                  "PROJECT IMAGE"
                )}
              </div>

              <span className="vm-project-category">
                {project.category}
              </span>

              <h3>{project.title}</h3>

              <p>{project.shortDescription || project.description}</p>

              <Button onClick={() => navigate(`/projects/${project.slug || project.id}`)}>
                View Details
              </Button>

            </GlassCard>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Projects;
