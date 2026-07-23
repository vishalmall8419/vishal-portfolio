import { Link } from "react-router-dom";
import "./Testimonials.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../../lib/publicApi";

// Fallback only used if the Testimonials CMS resource is empty/unreachable.
const FALLBACK_TESTIMONIALS = [
  { id: 1, name: "John Anderson", role: "Frontend Developer", message: "Vishal builds clean, responsive and modern user interfaces with great attention to detail." },
  { id: 2, name: "Sarah Williams", role: "UI/UX Designer", message: "Professional approach, modern design thinking and excellent development skills." },
  { id: 3, name: "David Miller", role: "Software Engineer", message: "Great problem solving skills and a continuous learning mindset. Highly recommended." },
];

function Testimonials() {
  const { data, loading } = usePublicData(() => publicApi.testimonials(), []);
  const testimonials =
    !loading && Array.isArray(data) && data.length
      ? data.map((row) => ({
          id: row.id,
          name: row.name,
          role: row.designation,
          message: row.review,
          photo: row.photo,
        }))
      : FALLBACK_TESTIMONIALS;

  return (
    <section className="vm-testimonials">

      <div className="vm-testimonials-container">

        <SectionTitle
          subtitle="TESTIMONIALS"
          title="What People"
          highlight=" Say"
          description="Feedback and appreciation from people I've collaborated and learned with."
          align="center"
        />

        <div className="vm-testimonial-grid">

          {testimonials.map((item) => (

            <GlassCard
              key={item.id}
              className="vm-testimonial-card"
            >

              <div className="vm-testimonial-avatar">
                {item.photo ? (
                  <img src={resolveAssetUrl(item.photo)} alt={item.name} />
                ) : (
                  item.name.charAt(0)
                )}
              </div>

              <p>"{item.message}"</p>

              <h3>{item.name}</h3>

              <span>{item.role}</span>

            </GlassCard>

          ))}

        </div>

        <div className="vm-testimonials-cta">
          <Link to="/testimonials" className="vm-testimonials-view-all">
            View All Testimonials
          </Link>
        </div>

      </div>

    </section>
  );
}

export default Testimonials;
