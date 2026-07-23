import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiMessageSquare,
  FiClock,
  FiDownload,
  FiMail,
  FiSearch,
  FiCpu,
  FiShield,
  FiCheckCircle,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import ChatPanel from "../../components/AIAssistant/ChatPanel";
import AIOrb from "./AIOrb";
import useAiAssistant from "../../hooks/useAiAssistant";
import useChatSessions from "../../hooks/useChatSessions";
import useSeo from "../../hooks/useSeo";
import { QUICK_QUESTIONS, INFO_CARDS, HOW_IT_WORKS, WHY_THIS_AI, FEATURES } from "./aiPageData";
import heroBgPhoto from "../../assets/images/backgrounds/hero-night-sky.avif";
import "./AI.css";

export default function AI() {
  useSeo("ai", {
    title: "AI Portfolio Assistant — Vishal Mall",
    description:
      "Ask questions about skills, projects, experience, and more. Answers come straight from this portfolio's own database.",
  });

  const ai = useAiAssistant();
  const { sessions, activeSessionId, newChat, openSession, clearAll } = useChatSessions(ai);
  const chatPanelRef = useRef(null);
  const chatSectionRef = useRef(null);
  const location = useLocation();

  const handleQuickQuestion = (question) => {
    if (!ai.sending) ai.sendMessage(question);
    chatPanelRef.current?.focusInput?.();
  };

  const handleStartChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => chatPanelRef.current?.focusInput?.(), 400);
  };

  useEffect(() => {
    if (location.state?.focusChat) {
      const id = setTimeout(handleStartChat, 150);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <>
      <main className="ai-page">
        <Navbar />

        <section className="ai-hero">
          <div
            className="ai-hero-bg-photo"
            style={{ backgroundImage: `url(${heroBgPhoto})` }}
            aria-hidden="true"
          ></div>
          <div className="ai-hero-inner">
            <div className="ai-hero-copy">
              <span className="ai-page-badge">✦ AI Powered</span>
              <h1 className="ai-page-title">
                AI Portfolio <span>Assistant</span>
              </h1>
              <p className="ai-page-subtitle">
                Ask anything about my skills, experience, projects, education, certifications,
                achievements, services, journey, and portfolio.
              </p>

              <div className="ai-hero-note">
                <span className="ai-hero-note-icon">
                  <FiCpu />
                </span>
                <p>
                  Get instant answers directly from my portfolio knowledge base. Every response is
                  generated using my portfolio database to ensure accurate, trustworthy information.
                </p>
              </div>

              <button type="button" className="ai-hero-cta" onClick={handleStartChat}>
                Start Chat <FiArrowRight />
              </button>
            </div>

            <div className="ai-hero-visual">
              <AIOrb />
            </div>
          </div>

          <div className="ai-quick-questions">
            <h3>Quick Questions</h3>
            <div className="ai-chip-grid">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className="ai-chip"
                  onClick={() => handleQuickQuestion(q.question)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-chat-section" ref={chatSectionRef}>
          <div className="ai-chat-shell">
            <aside className="ai-chat-sidebar">
              <button type="button" className="ai-sidebar-new" onClick={newChat}>
                <FiPlus /> New Chat
              </button>

              <div className="ai-sidebar-history">
                <span className="ai-sidebar-label">
                  <FiClock /> Chat History
                </span>
                {sessions.length === 0 ? (
                  <p className="ai-sidebar-empty">Your conversations will appear here.</p>
                ) : (
                  <ul>
                    {sessions.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          className={`ai-sidebar-session ${s.id === activeSessionId ? "active" : ""}`}
                          onClick={() => openSession(s.id)}
                        >
                          <FiMessageSquare />
                          <span>{s.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {sessions.length > 0 && (
                <button type="button" className="ai-sidebar-clear" onClick={clearAll}>
                  <FiTrash2 /> Clear All Chats
                </button>
              )}
            </aside>

            <div className="ai-chat-main">
              {ai.configLoading ? (
                <p className="ai-page-status">Loading assistant…</p>
              ) : !ai.enabled ? (
                <p className="ai-page-status">The AI assistant is currently unavailable.</p>
              ) : (
                <ChatPanel ref={chatPanelRef} ai={ai} />
              )}
            </div>
          </div>
        </section>

        <section className="ai-info">
          <div className="ai-info-head">
            <h2>What can I help you with?</h2>
            <p>Here are some things you can ask me about.</p>
          </div>
          <div className="ai-info-grid">
            {INFO_CARDS.map((card) => (
              <Link key={card.id} to={card.path} className="ai-info-card">
                <span className="ai-info-card-title">{card.title}</span>
                <span className="ai-info-card-desc">{card.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="ai-details">
          <div className="ai-details-grid">
            <div className="ai-details-card">
              <h3>How It Works</h3>
              <ol className="ai-steps">
                {HOW_IT_WORKS.map((s) => (
                  <li key={s.step}>
                    <span className="ai-step-num">{s.step}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="ai-details-card">
              <h3>Why This AI?</h3>
              <ul className="ai-checklist">
                {WHY_THIS_AI.map((item) => (
                  <li key={item}>
                    <FiCheckCircle /> {item}
                  </li>
                ))}
              </ul>

              <h3 className="ai-details-subhead">
                <FiZap /> Features
              </h3>
              <ul className="ai-feature-list">
                {FEATURES.map((f) => (
                  <li key={f.title}>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-details-card ai-notice-card">
              <h3>
                <FiShield /> Important
              </h3>
              <p>
                I only answer questions related to this portfolio. If I don&apos;t find something in
                my database, I&apos;ll say so instead of guessing.
              </p>
              <blockquote>
                <FiSearch /> "I couldn't find that information."
              </blockquote>
            </div>
          </div>
        </section>

        <section className="ai-cta">
          <div className="ai-cta-inner">
            <div>
              <h2>Ready to Explore My Portfolio?</h2>
              <p>
                Start a conversation with my AI Portfolio Assistant and instantly discover my
                experience, projects, technical skills, education, achievements, certifications, and
                more.
              </p>
            </div>
            <div className="ai-cta-actions">
              <button type="button" className="ai-cta-btn ai-cta-btn-primary" onClick={handleStartChat}>
                ✦ Start Chat
              </button>
              <Link to="/resume" className="ai-cta-btn">
                <FiDownload /> Download Resume
              </Link>
              <Link to="/contact" className="ai-cta-btn">
                <FiMail /> Contact Me
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
