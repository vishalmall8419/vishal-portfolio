import { useLayoutEffect, useRef } from "react";
import aboutImage from "../../../assets/images/profile/about.webp";
import heroBgPhoto from "../../../assets/images/backgrounds/hero-night-sky.avif";
import { FaArrowDownLong } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { gsap } from "../../../lib/gsap";
import useTheme from "../../../hooks/useTheme";
import { resolveAssetUrl } from "../../../lib/publicApi";

function Hero() {
    const rootRef = useRef(null);
    const { siteSettings } = useTheme();
    const resumeUrl = resolveAssetUrl(siteSettings?.resume);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance sequence — runs once on load, not scroll-driven.
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                delay: 0.15,
            });

            tl.from(".hero__eyebrow", { autoAlpha: 0, y: 16, duration: 0.7 })
                .from(
                    ".hero__title-line",
                    { autoAlpha: 0, y: 46, duration: 0.9, stagger: 0.12 },
                    "-=0.35"
                )
                .from(".hero__lede", { autoAlpha: 0, y: 24, duration: 0.8 }, "-=0.5")
                .from(".hero__meta", { autoAlpha: 0, y: 20, duration: 0.7 }, "-=0.5")
                .from(
                    ".hero__frame",
                    { autoAlpha: 0, scale: 0.88, duration: 1.1, ease: "power4.out" },
                    "-=1"
                )
                .from(
                    ".hero__tag",
                    { autoAlpha: 0, y: 16, scale: 0.9, stagger: 0.1, duration: 0.6 },
                    "-=0.6"
                )
                .from(".hero__scroll", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.3");

            // Ambient float for the tech tags — continuous, subtle.
            gsap.utils.toArray(".hero__tag").forEach((tag, i) => {
                gsap.to(tag, {
                    y: i % 2 === 0 ? -14 : 14,
                    duration: 3.4 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.3,
                });
            });

            // Gentle parallax on the orbs as the hero scrolls out.
            gsap.to(".hero__orb--one", {
                y: 120,
                x: 40,
                ease: "none",
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.to(".hero__orb--two", {
                y: -100,
                scale: 1.1,
                ease: "none",
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="hero" aria-label="Introduction" ref={rootRef}>
            <div
                className="hero__bg-photo"
                style={{ backgroundImage: `url(${heroBgPhoto})` }}
                aria-hidden="true"
            />
            <div className="hero__field" aria-hidden="true" />
            <div className="hero__orb hero__orb--one" aria-hidden="true" />
            <div className="hero__orb hero__orb--two" aria-hidden="true" />

            <div className="shell hero__grid">
                <div className="hero__copy">
                    <span className="eyebrow hero__eyebrow">
                        <span className="eyebrow__dot" aria-hidden="true" />
                        Available for new work
                    </span>

                    <h1 className="hero__title">
                        <span className="hero__title-line">Building</span>
                        <span className="hero__title-line hero__title-line--accent">
                            Digital Experiences
                        </span>
                        <span className="hero__title-line">That Matter.</span>
                    </h1>

                    <p className="hero__lede">
                        Hi, I'm <strong>{siteSettings?.name || "Vishal Mall"}</strong>, a Full Stack Developer
                        who turns ideas into fast, scalable, beautifully considered
                        web applications — because technology should solve real
                        problems while feeling effortless to use.
                    </p>

                    <div className="hero__meta">
                        <div className="hero__meta-item">
                            <small>Location</small>
                            <h4>{siteSettings?.address || "Uttar Pradesh, India"}</h4>
                        </div>
                        <div className="hero__meta-divider" aria-hidden="true" />
                        <div className="hero__meta-item">
                            <small>Speciality</small>
                            <h4>Full Stack Development</h4>
                        </div>
                        {resumeUrl && (
                            <a href={resumeUrl} target="_blank" rel="noreferrer" className="hero__resume-btn">
                                <FiDownload /> Resume
                            </a>
                        )}
                    </div>
                </div>

                <div className="hero__portrait">
                    <div className="hero__portrait-glow" aria-hidden="true" />

                    <figure className="hero__frame">
                        <img src={resolveAssetUrl(siteSettings?.avatar) || aboutImage} alt={`Portrait of ${siteSettings?.name || "Vishal Mall"}`} />
                    </figure>

                    <ul className="hero__tags" aria-label="Core technologies">
                        <li className="hero__tag hero__tag--one">Java</li>
                        <li className="hero__tag hero__tag--two">React</li>
                        <li className="hero__tag hero__tag--three">Node</li>
                    </ul>
                </div>
            </div>

            <div className="hero__scroll">
                <span>Scroll to explore</span>
                <FaArrowDownLong aria-hidden="true" />
            </div>
        </section>
    );
}

export default Hero;
