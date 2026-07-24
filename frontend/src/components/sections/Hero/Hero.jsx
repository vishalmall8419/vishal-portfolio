import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

import "./Hero.css";
import Button from "../../ui/Button";
import useTheme from "../../../hooks/useTheme";
import { resolveAssetUrl } from "../../../lib/publicApi";
import heroFallback from "../../../assets/images/profile/hero.webp";
import heroBgPhoto from "../../../assets/images/backgrounds/hero-night-sky.avif";

function Hero() {
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { siteSettings } = useTheme();
  const avatarSrc = resolveAssetUrl(siteSettings?.avatar) || heroFallback;
  const name = siteSettings?.name || "Vishal Mall";
  const resumeUrl = resolveAssetUrl(siteSettings?.resume);

  useEffect(() => {
    const ctx = gsap.context(() => {

      const tl = gsap.timeline();

      tl.from(".vm-badge", {
        y: 40,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          ".vm-title",
          {
            y: 60,
            opacity: 0,
            duration: 1,
          },
          "-=0.5"
        )
        .from(
          ".vm-description",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ".vm-buttons",
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ".vm-stats",
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ".vm-profile",
          {
            x: 120,
            opacity: 0,
            scale: .8,
            duration: 1.3,
            ease: "back.out(1.7)",
          },
          "-=1"
        );

      gsap.to(".vm-tech", {
        y: -12,
        repeat: -1,
        yoyo: true,
        duration: 2.5,
        stagger: 0.25,
        ease: "sine.inOut",
      });

      gsap.to(".vm-platform", {
        scale: 1.03,
        repeat: -1,
        yoyo: true,
        duration: 2.2,
        ease: "sine.inOut",
      });

    }, heroRef);

    return () => ctx.revert();

  }, []);

  return (
    <section
      className="vm-hero"
      ref={heroRef}
    >

      <div
        className="vm-hero-bg-photo"
        style={{ backgroundImage: `url(${heroBgPhoto})` }}
        aria-hidden="true"
      ></div>

      <div className="vm-overlay"></div>

      <div className="vm-stars"></div>

      <div className="vm-hero-grid">

        {/* LEFT */}

        <div className="vm-hero-left">

          <span className="vm-badge">

            <span className="vm-dot"></span>

            AVAILABLE FOR WORK

          </span>

          <h1 className="vm-title">

            Building

            <br />

            <span>Future Ready</span>
            
            Web Experiences

          </h1>

          <p className="vm-description">
            I'm {name}, a Java Full Stack Developer creating premium,
            scalable and modern web applications using Java, React,
            Spring Boot, Node.js and MySQL.
          </p>

          <div className="vm-buttons">

            <Button size="lg" onClick={() => navigate("/projects")}>
              Explore Projects
            </Button>

            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="vm-resume-link">
                <Button variant="outline" size="lg">
                  Download Resume
                </Button>
              </a>
            ) : (
              <Button variant="outline" size="lg" disabled>
                Download Resume
              </Button>
            )}

          </div>

          <div className="vm-stats">

            <div>
              <h2>20+</h2>
              <span>Projects</span>
            </div>

            <div>
              <h2>15+</h2>
              <span>Technologies</span>
            </div>

            <div>
              <h2>100%</h2>
              <span>Dedication</span>
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="vm-hero-right">

          <div className="vm-tech react">
            ⚛ React
          </div>

          <div className="vm-tech spring">
            🌱 Spring
          </div>

          <div className="vm-tech java">
            ☕ Java
          </div>

          <div className="vm-tech mysql">
            🗄 MySQL
          </div>

          {/* Image */}

          <div className="vm-profile" style={{ backgroundImage: `url(${avatarSrc})` }}></div>

          {/* 3D Ring */}

          <div className="vm-platform"></div>

        </div>

      </div>

    </section>
  );
}

export default Hero;