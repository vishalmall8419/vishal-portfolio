import { useState } from "react";
import "./Contact.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import Button from "../../ui/Button";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

const FALLBACK_SETTINGS = {
  email: "vishal.mall02@outlook.com",
  phone: "+91 8419073041",
  address: "Maharajganj, Uttar Pradesh, India",
};

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

function Contact() {
  const { data: settings } = usePublicData(() => publicApi.settings(), []);
  const info = {
    email: settings?.email || FALLBACK_SETTINGS.email,
    phone: settings?.phone || FALLBACK_SETTINGS.phone,
    address: settings?.address || FALLBACK_SETTINGS.address,
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ state: "error", message: "Please fill in your name, email and message." });
      return;
    }
    setStatus({ state: "sending", message: "" });
    try {
      await publicApi.contact(form);
      setStatus({ state: "success", message: "Thanks — your message has been sent!" });
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus({
        state: "error",
        message: err?.response?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <section className="vm-contact">

      <div className="vm-contact-container">

        <SectionTitle
          subtitle="CONTACT"
          title="Let's"
          highlight=" Connect"
          description="Have a project, job opportunity or collaboration in mind? Let's build something amazing together."
          align="center"
        />

        <div className="vm-contact-grid">

          <GlassCard className="vm-contact-info">

            <h3>Get In Touch</h3>

            <div className="vm-contact-item">
              <strong>Email</strong>
              <span>{info.email}</span>
            </div>

            <div className="vm-contact-item">
              <strong>Phone</strong>
              <span>{info.phone}</span>
            </div>

            <div className="vm-contact-item">
              <strong>Location</strong>
              <span>{info.address}</span>
            </div>

          </GlassCard>

          <GlassCard>

            <form className="vm-contact-form" onSubmit={handleSubmit}>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
              />

              <textarea
                rows="6"
                name="message"
                placeholder="Write your message..."
                value={form.message}
                onChange={handleChange}
              ></textarea>

              <Button fullWidth type="submit" loading={status.state === "sending"}>
                Send Message
              </Button>

              {status.message && (
                <p className={`vm-contact-status ${status.state === "success" ? "is-success" : "is-error"}`}>
                  {status.message}
                </p>
              )}

            </form>

          </GlassCard>

        </div>

      </div>

    </section>
  );
}

export default Contact;
