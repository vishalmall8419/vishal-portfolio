import { useRef } from "react";
import useScrollReveal from "../hooks/useScrollReveal";
import useTheme from "../../../hooks/useTheme";

function Vision() {
    const rootRef = useRef(null);
    const { siteSettings } = useTheme();

    useScrollReveal(rootRef, { start: "top 75%" });

    const futureVision = siteSettings?.aboutContent?.futureVision;
    const missionGoal = siteSettings?.aboutContent?.missionGoal;

    return (
        <section className="vision" aria-label="Future vision" ref={rootRef}>
            <span className="vision__ghost-word" aria-hidden="true">
                Vision
            </span>

            <div className="shell vision__layout">
                <header className="vision__heading" data-reveal>
                    <span className="eyebrow">Future Vision</span>
                    <h2 className="section-title">
                        Building Products
                        <br />
                        That Matter.
                    </h2>
                </header>

                <div className="vision__body">
                    {futureVision ? (
                        futureVision
                            .split(/\n\s*\n/)
                            .filter(Boolean)
                            .map((para, i) => (
                                <p className={i === 0 ? "vision__lede" : undefined} data-reveal key={i}>
                                    {para}
                                </p>
                            ))
                    ) : (
                        <>
                            <p className="vision__lede" data-reveal>
                                My ambition extends beyond becoming a Full Stack Developer.
                                I aspire to build digital products that solve meaningful
                                real-world problems and positively impact people's lives.
                            </p>

                            <p data-reveal>
                                One of the ideas closest to my heart is{" "}
                                <strong>GramNirman</strong> — a platform designed to
                                digitally connect customers, skilled workers, hardware
                                shops and building material suppliers across rural India.
                            </p>

                            <p data-reveal>
                                Every project I develop today is a stepping stone toward
                                that larger vision. I'm continuously improving not only my
                                technical skills but also my understanding of product
                                design, user experience and scalable systems.
                            </p>
                        </>
                    )}

                    {missionGoal && (
                        <p data-reveal className="vision__mission">
                            {missionGoal}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Vision;
