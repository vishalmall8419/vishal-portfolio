import { useLayoutEffect, useRef } from "react";
import { gsap } from "../../../lib/gsap";
import useScrollReveal from "../hooks/useScrollReveal";

function GramNirman() {
    const rootRef = useRef(null);

    useScrollReveal(rootRef, { start: "top 75%" });

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".dream__ghost-word", {
                y: -60,
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
        <section
            className="dream"
            aria-label="GramNirman, my biggest dream"
            ref={rootRef}
        >
            <span className="dream__ghost-word" aria-hidden="true">
                Dream
            </span>

            <div className="shell">
                <header className="dream__heading" data-reveal>
                    <span className="eyebrow">My Biggest Dream</span>
                    <h2 className="section-title">
                        Building <span className="text-accent">GramNirman</span>
                    </h2>
                </header>

                <div className="dream__layout">
                    <div className="dream__intro" data-reveal>
                        <p>
                            Every developer has a dream project.
                            <br />
                            <br />
                            Mine is <strong>GramNirman.</strong>
                        </p>
                    </div>

                    <div className="dream__details">
                        <p data-reveal>
                            GramNirman is more than a startup idea. It represents my
                            vision of using technology to improve the construction
                            ecosystem in rural India.
                        </p>

                        <p data-reveal>
                            My goal is to build a platform where people can easily
                            find verified labour, compare prices of construction
                            materials, connect with local shops, hire professionals,
                            and manage complete construction projects from one
                            place.
                        </p>

                        <p data-reveal>
                            Millions of people living in villages still struggle to
                            access transparent pricing, trusted workers and
                            organized construction services. I believe technology
                            can bridge this gap.
                        </p>

                        <p data-reveal>
                            Every portfolio project I build today is preparing me
                            for that vision. I'm learning architecture, product
                            thinking, UI/UX, backend engineering, cloud deployment
                            and scalable application development so that one day I
                            can transform GramNirman into a real company.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default GramNirman;
