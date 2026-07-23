import { useNavigate } from "react-router-dom";
import "./CTA.css";
import Button from "../../ui/Button";

function CTA() {
  const navigate = useNavigate();
  return (
    <section className="vm-cta">

      <div className="vm-cta-container">

        <span className="vm-cta-tag">
          AVAILABLE FOR WORK
        </span>

        <h2>
          Let's Build Something
          <br />
          Extraordinary Together
        </h2>

        <p>
          I'm currently available for Full Time, Freelance,
          Internship and exciting collaboration opportunities.
        </p>

        <div className="vm-cta-buttons">

          <Button onClick={() => navigate("/hire-me")}>
            Hire Me
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
          >
            View Projects
          </Button>

        </div>

      </div>

    </section>
  );
}

export default CTA;