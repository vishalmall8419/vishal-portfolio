import { useState } from "react";
import { FiCheckCircle, FiDownload, FiSend } from "react-icons/fi";
import "./HireMe.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import useSeo from "../../hooks/useSeo";

const PROJECT_TYPES = ["Full-time role", "Freelance project", "Contract work", "Consultation", "Other"];
const BUDGETS = ["Under $500", "$500 - $1,500", "$1,500 - $5,000", "$5,000+", "Not sure yet"];

const WHY_HIRE_ME = [
  "End-to-end ownership — from database schema to deployed product",
  "Clean, maintainable code with production-ready practices",
  "Clear communication and realistic timelines",
  "Post-launch support and iteration",
];

function HireMe() {
  useSeo("hire-me", {
    title: "Hire Me — Vishal Mall",
    description: "Available for full-time roles, freelance projects, and contract work.",
  });

  const { siteSettings } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: PROJECT_TYPES[0],
    budget: BUDGETS[0],
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Name, email, and message are required.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await publicApi.contact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Hire Me — ${form.projectType} (${form.budget})`,
        message: form.message,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", projectType: PROJECT_TYPES[0], budget: BUDGETS[0], message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Something went wrong. Please try again or email me directly.");
    }
  };

  const resumeUrl = resolveAssetUrl(siteSettings?.resume);
  const name = siteSettings?.name || "Vishal Mall";
  const role = siteSettings?.role || "Full Stack Developer";

  return (
    <>
      <main className="hire-page">
        <Navbar />

        <section className="hire-hero">
          <span className="hire-hero__eyebrow">// hire me</span>
          <h1 className="hire-hero__title">
            Let&rsquo;s build your next product, <span>together</span>.
          </h1>
          <p className="hire-hero__subtitle">
            {name} — {role}. Available for full-time roles, freelance projects, and contract work.
          </p>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="hire-hero__resume">
              <FiDownload /> Download Resume
            </a>
          )}
        </section>

        <section className="hire-why">
          <h2>Why work with me</h2>
          <ul>
            {WHY_HIRE_ME.map((point) => (
              <li key={point}>
                <FiCheckCircle className="hire-why__icon" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="hire-form-section">
          <div className="hire-form-card">
            <h2>Tell me about your project</h2>
            <p>Fill out the form and I&rsquo;ll get back to you within 24-48 hours.</p>

            <form className="hire-form" onSubmit={handleSubmit}>
              <div className="hire-form__row">
                <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Your email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="hire-form__row">
                <input type="tel" name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />
                <select name="projectType" value={form.projectType} onChange={handleChange}>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="hire-form__row">
                <select name="budget" value={form.budget} onChange={handleChange}>
                  {BUDGETS.map((budget) => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>
              <textarea
                name="message"
                placeholder="Describe your project, goals, and timeline..."
                rows={6}
                value={form.message}
                onChange={handleChange}
                required
              />
              <button type="submit" className="hire-form__submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending..." : <><FiSend /> Send Inquiry</>}
              </button>
              {status === "success" && (
                <p className="hire-form__status hire-form__status--success">
                  Thanks — your inquiry has been sent. I&rsquo;ll be in touch soon.
                </p>
              )}
              {status === "error" && (
                <p className="hire-form__status hire-form__status--error">{errorMsg}</p>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default HireMe;
