import "./Services.css";
import { Link } from "react-router-dom";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

// Fallback content shown only if the API has no services yet / is unreachable,
// so the section never renders empty while the CMS is still being filled in.
const FALLBACK_SERVICES = [
  {
    id: 1,
    title: "Frontend Development",
    description:
      "Modern, responsive and interactive websites using React, Tailwind CSS and JavaScript.",
  },
  {
    id: 2,
    title: "Backend Development",
    description:
      "Scalable REST APIs with Java, Spring Boot, Node.js, Express and MySQL.",
  },
  {
    id: 3,
    title: "Full Stack Development",
    description:
      "Complete end-to-end web application development from UI to deployment.",
  },
  {
    id: 4,
    title: "UI / UX Design",
    description:
      "Modern premium interfaces inspired by Apple, Stripe, Linear and Framer.",
  },
  {
    id: 5,
    title: "Performance Optimization",
    description:
      "Fast loading websites with SEO optimization, accessibility and Lighthouse best practices.",
  },
  {
    id: 6,
    title: "Website Maintenance",
    description:
      "Continuous improvements, bug fixing, feature development and long-term support.",
  },
];

function Services() {
  const { data, loading } = usePublicData(() => publicApi.services(), []);
  const hasLiveData = !loading && Array.isArray(data) && data.length > 0;
  const services = hasLiveData ? data : FALLBACK_SERVICES;

  return (
    <section className="vm-services">

      <div className="vm-services-container">

        <SectionTitle
          subtitle="SERVICES"
          title="What I"
          highlight=" Build"
          description="I create modern, scalable and production-ready web applications with premium UI and exceptional user experience."
          align="center"
        />

        <div className="vm-services-grid">

          {services.map((service, index) => {
            const card = (
              <GlassCard key={service.id} className="vm-service-card">
                <div className="vm-service-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>
              </GlassCard>
            );
            return hasLiveData ? (
              <Link to={`/services/${service.id}`} key={service.id} className="vm-service-card-link">
                {card}
              </Link>
            ) : (
              card
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default Services;
