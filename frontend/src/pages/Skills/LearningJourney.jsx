import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./LearningJourney.css";

gsap.registerPlugin(ScrollTrigger);

const LJX_STEPS = [
  {
    tag: "Origin",
    year: "Year One",
    title: "The First Line of Code",
    text: "A single HTML tag rendering on screen was the first real proof that typed instructions could become something visible.",
  },
  {
    tag: "Curiosity",
    year: "Year One",
    title: "Falling for the Browser",
    text: "CSS turned flat markup into layout and motion, and the browser stopped being a mystery and became a canvas.",
  },
  {
    tag: "Logic",
    year: "Year Two",
    title: "From Static to Dynamic",
    text: "JavaScript introduced behaviour, state, and the first real bugs worth staying up late to solve.",
  },
  {
    tag: "Structure",
    year: "Year Two",
    title: "Learning to Think in Systems",
    text: "React reframed interfaces as components and data flow, replacing scattered scripts with something that could actually scale.",
  },
  {
    tag: "Depth",
    year: "Year Three",
    title: "Shipping Real Products",
    text: "Java and Spring Boot opened the other half of the stack, turning ideas into full products with a server behind them.",
  },
  {
    tag: "Forward",
    year: "Ongoing",
    title: "What's Next",
    text: "System design, cloud infrastructure, and the deeper architecture decisions behind software built to scale.",
  },
];

const LearningJourney = () => {
  const ljxSectionRef = useRef(null);
  const ljxTrackRef = useRef(null);
  const ljxCardRefs = useRef([]);
  const ljxFillRef = useRef(null);
  const ljxDotRef = useRef(null);
  const [ljxActiveIndex, setLjxActiveIndex] = useState(0);

  ljxCardRefs.current = [];

  const ljxRegisterCard = (el) => {
    if (el && !ljxCardRefs.current.includes(el)) {
      ljxCardRefs.current.push(el);
    }
  };

  useEffect(() => {
    const ljxCtx = gsap.context(() => {
      const cards = ljxCardRefs.current;

      cards.forEach((card, index) => {
        gsap.set(card, { opacity: 0, y: 70, scale: 0.94, filter: "blur(14px)" });

        ScrollTrigger.create({
          trigger: card,
          start: "top 78%",
          end: "top 40%",
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            });
            const prev = cards[index - 1];
            if (prev) {
              gsap.to(prev, {
                scale: 0.94,
                opacity: 0.35,
                filter: "blur(6px)",
                duration: 0.9,
                ease: "power3.out",
                overwrite: "auto",
              });
            }
            setLjxActiveIndex(index);
          },
          onEnterBack: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            });
            setLjxActiveIndex(index);
          },
          onLeaveBack: () => {
            gsap.to(card, {
              opacity: 0,
              y: 70,
              scale: 0.94,
              filter: "blur(14px)",
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            });
            const prev = cards[index - 1];
            if (prev) {
              gsap.to(prev, {
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.7,
                ease: "power3.out",
                overwrite: "auto",
              });
              setLjxActiveIndex(index - 1);
            }
          },
        });
      });

      ScrollTrigger.create({
        trigger: ljxTrackRef.current,
        start: "top 60%",
        end: "bottom 60%",
        scrub: 0.4,
        onUpdate: (self) => {
          gsap.set(ljxFillRef.current, { scaleY: self.progress });
          gsap.set(ljxDotRef.current, { top: `${self.progress * 100}%` });
        },
      });
    }, ljxSectionRef);

    const ljxHandleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", ljxHandleResize);

    return () => {
      window.removeEventListener("resize", ljxHandleResize);
      ljxCtx.revert();
    };
  }, []);

  return (
    <section className="ljx-section" ref={ljxSectionRef} aria-label="Learning Journey">
      <div className="ljx-glow ljx-glow--a" />
      <div className="ljx-glow ljx-glow--b" />
      <div className="ljx-bg-word" aria-hidden="true">Journey</div>

      <header className="ljx-header">
        <span className="ljx-eyebrow">// learning-journey</span>
        <h2 className="ljx-title">Learning Journey</h2>
        <p className="ljx-subtitle">Every stage that led to where this stands today.</p>
      </header>

      <div className="ljx-wrapper">
        <div className="ljx-rail" aria-hidden="true">
          <div className="ljx-rail-track">
            <div className="ljx-rail-fill" ref={ljxFillRef} />
          </div>
          <span className="ljx-dot" ref={ljxDotRef} />
        </div>

        <div className="ljx-track" ref={ljxTrackRef}>
          {LJX_STEPS.map((step, index) => (
            <article
              className="ljx-card"
              ref={ljxRegisterCard}
              key={step.title}
              aria-current={index === ljxActiveIndex ? "step" : undefined}
            >
              <div className="ljx-card-border" />
              <div className="ljx-card-inner">
                <div className="ljx-card-top">
                  <span className="ljx-card-tag">{step.tag}</span>
                  <span className="ljx-card-year">{step.year}</span>
                </div>
                <h3 className="ljx-card-title">{step.title}</h3>
                <p className="ljx-card-text">{step.text}</p>
                <span className="ljx-card-index">{String(index + 1).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="ljx-markers" role="tablist" aria-label="Journey progress">
          {LJX_STEPS.map((step, index) => (
            <span
              key={step.title}
              className={`ljx-marker${index === ljxActiveIndex ? " ljx-marker--active" : ""}`}
              role="tab"
              aria-selected={index === ljxActiveIndex}
              aria-label={step.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningJourney;
