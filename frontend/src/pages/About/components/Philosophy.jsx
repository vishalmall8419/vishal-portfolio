import { useRef } from "react";
import focusAreas from "../data/focus";
import useScrollReveal from "../hooks/useScrollReveal";

function Philosophy() {
    const rootRef = useRef(null);

    useScrollReveal(rootRef, { selector: "[data-reveal]", start: "top 75%" });
    useScrollReveal(rootRef, {
        selector: ".focus-card",
        y: 28,
        stagger: 0.1,
        start: "top 80%",
    });

    return (
        <section
            className="philosophy"
            aria-label="Philosophy and current focus"
            ref={rootRef}
        >
            <span className="philosophy__ghost-word" aria-hidden="true">
                Create
            </span>

            <div className="shell">
                <div className="philosophy__intro">
                    <span className="eyebrow" data-reveal>
                        My Philosophy
                    </span>
                    <h2 className="section-title" data-reveal>
                        I Don't Just
                        <br />
                        Write Code.
                    </h2>

                    <blockquote className="pull-quote pull-quote--large" data-reveal>
                        Technology should make people's lives easier, not more
                        complicated.
                    </blockquote>

                    <p data-reveal>
                        My philosophy has always been simple — every application
                        should solve a real problem before it tries to impress
                        anyone. Beautiful interfaces matter, but meaningful
                        experiences matter even more.
                    </p>

                    <p data-reveal>
                        I enjoy understanding how users think, identifying pain
                        points and designing solutions that feel natural. Whether
                        it's a small portfolio website or a large business
                        platform, I believe simplicity, accessibility and
                        performance should always come first.
                    </p>
                </div>

                <div className="philosophy__focus">
                    <div className="philosophy__focus-heading" data-reveal>
                        <span className="eyebrow">Current Focus</span>
                        <h3>What I'm learning right now</h3>
                    </div>

                    <ul className="focus-grid">
                        {focusAreas.map((item) => (
                            <li className="focus-card" key={item.title}>
                                <span className="focus-card__code" aria-hidden="true">
                                    {item.code}
                                </span>
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default Philosophy;
