import { useRef } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

function CallToAction() {
    const rootRef = useRef(null);

    useScrollReveal(rootRef, { start: "top 78%", stagger: 0.15 });

    return (
        <section className="finale" aria-label="Get in touch" ref={rootRef}>
            <span className="finale__ghost-word" aria-hidden="true">
                Let's Build
            </span>

            <div className="shell finale__inner">
                <span className="eyebrow" data-reveal>
                    Thank You
                </span>
                <h2 className="section-title finale__title" data-reveal>
                    Let's Create Something
                    <br />
                    Amazing Together.
                </h2>

                <p className="finale__lede" data-reveal>
                    Whether you're looking for a passionate developer, a creative
                    collaborator, or someone who genuinely enjoys building
                    meaningful digital products — I'd love to connect.
                </p>

                <div className="finale__actions" data-reveal>
                    <button className="btn btn--primary" type="button">
                        Start a Project
                    </button>
                    <button className="btn btn--ghost" type="button">
                        View My Work
                    </button>
                </div>
            </div>
        </section>
    );
}

export default CallToAction;
