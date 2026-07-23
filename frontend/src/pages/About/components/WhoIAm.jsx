import { useLayoutEffect, useRef } from "react";
import aboutImage from "../../../assets/images/profile/about.webp";
import { gsap } from "../../../lib/gsap";
import useScrollReveal from "../hooks/useScrollReveal";
import useTheme from "../../../hooks/useTheme";
import { resolveAssetUrl } from "../../../lib/publicApi";

function WhoIAm() {
    const rootRef = useRef(null);
    const { siteSettings } = useTheme();

    useScrollReveal(rootRef, { start: "top 72%" });

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(".who__frame", { autoAlpha: 0, y: 50, scale: 0.94 });
            gsap.to(".who__frame", {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top 75%",
                    once: true,
                },
            });

            // Subtle parallax drift on the portrait as the section scrolls by.
            gsap.to(".who__media", {
                y: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="who" aria-label="My story" ref={rootRef}>
            <span className="who__ghost-word" aria-hidden="true">
                About
            </span>

            <div className="shell who__grid">
                <div className="who__media">
                    <div className="who__media-glow" aria-hidden="true" />
                    <figure className="who__frame">
                        <img src={resolveAssetUrl(siteSettings?.avatar) || aboutImage} alt={`${siteSettings?.name || "Vishal Mall"} at work`} />
                    </figure>
                </div>

                <div className="who__copy">
                    <span className="eyebrow" data-reveal>
                        My Story
                    </span>
                    <h2 className="section-title" data-reveal>
                        More Than Just
                        <br />
                        A Developer.
                    </h2>

                    <p className="who__drop-cap" data-reveal>
                        My journey into software development didn't begin with a
                        perfect roadmap — it began with curiosity. I was fascinated
                        by how websites worked, how a few lines of code could
                        transform a simple idea into something interactive and
                        useful.
                    </p>

                    {!siteSettings?.aboutContent?.myStory && (
                    <>
                    <p data-reveal>
                        That curiosity slowly turned into passion. I started
                        learning HTML and CSS, then JavaScript, and gradually moved
                        into Java, databases, backend development and modern
                        frontend frameworks. Every technology introduced a new
                        challenge, and every challenge motivated me to learn even
                        more.
                    </p>

                    <p data-reveal>
                        Instead of memorizing syntax, I focus on understanding
                        concepts. I enjoy breaking complex problems into smaller
                        pieces and building solutions that are clean, scalable and
                        easy to maintain. Writing code isn't just about making
                        something work; it's about creating software that people
                        enjoy using.
                    </p>

                    <blockquote className="pull-quote" data-reveal>
                        I don't want to build just websites. I want to build
                        products that people genuinely remember.
                    </blockquote>

                    <p data-reveal>
                        Over time, I realized that being a developer isn't only
                        about programming. It's about communication,
                        problem-solving, continuous learning and paying attention
                        to every small detail that improves the user's experience.
                    </p>

                    <p data-reveal>
                        Today, I spend most of my time building projects, exploring
                        modern technologies, improving UI/UX, learning scalable
                        architecture and preparing myself for larger products that
                        can create real-world impact.
                    </p>
                    </>
                    )}

                    {siteSettings?.aboutContent?.myStory &&
                        siteSettings.aboutContent.myStory
                            .split(/\n\s*\n/)
                            .filter(Boolean)
                            .map((para, i) => (
                                <p data-reveal key={i}>
                                    {para}
                                </p>
                            ))}

                    <div className="who__signature" data-reveal>
                        <h3>{siteSettings?.name || "Vishal Mall"}</h3>
                        <span>{siteSettings?.role || "Full Stack Developer · Problem Solver · Product Builder"}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhoIAm;
