import "./Education.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

// Fallback only used if the Education CMS resource is empty/unreachable.
const FALLBACK_EDUCATION = [
  {
    year: "2025 - 2028",
    degree: "Bachelor of Technology (B.Tech)",
    college: "Shrinath Ji Institute for Technical Education",
    location: "Meerut, Uttar Pradesh",
    status: "Currently Pursuing",
  },
  {
    year: "2021 - 2024",
    degree: "Diploma in Information Technology",
    college: "Mahamaya Polytechnic of Information Technology",
    location: "Sant Kabir Nagar, Uttar Pradesh",
    status: "Completed",
  },
  {
    year: "2020 - 2021",
    degree: "Intermediate (Class 12)",
    college: "Sachidanand Inter College",
    location: "Kaptanganj, Kushinagar",
    status: "Completed",
  },
  {
    year: "2018 - 2019",
    degree: "High School (Class 10)",
    college: "Sachidanand Inter College",
    location: "Kaptanganj, Kushinagar",
    status: "Completed",
  },
];

function Education() {
  const { data, loading } = usePublicData(() => publicApi.education(), []);
  const rows =
    !loading && Array.isArray(data) && data.length
      ? data.map((row) => ({
          year: row.session,
          degree: row.degree,
          college: row.institute,
          location: row.description,
          status: row.marks,
        }))
      : FALLBACK_EDUCATION;

  return (
    <section className="vm-education">

      <div className="vm-education-container">

        <SectionTitle
          subtitle="EDUCATION"
          title="My Academic"
          highlight=" Journey"
          description="A timeline of my educational background and continuous learning."
          align="center"
        />

        <div className="vm-education-list">

          {rows.map((item, index) => (

            <GlassCard
              key={index}
              className="vm-education-card"
            >

              <div className="vm-year">
                {item.year}
              </div>

              <h3>{item.degree}</h3>

              <h4>{item.college}</h4>

              {item.location && <p>{item.location}</p>}

              {item.status && (
                <span className="vm-status">
                  {item.status}
                </span>
              )}

            </GlassCard>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Education;
