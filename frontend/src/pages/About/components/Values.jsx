import { useRef } from "react";
import values from "../data/values";
import useScrollReveal from "../hooks/useScrollReveal";

function Values() {
    const rootRef = useRef(null);

    useScrollReveal(rootRef, { selector: "[data-reveal]", start: "top 75%" });
    useScrollReveal(rootRef, {
        selector: ".value-row",
        y: 30,
        stagger: 0.12,
        start: "top 80%",
    });

    return (
        <section className="values" aria-label="My values" ref={rootRef}>
            <div className="shell">
                <header className="values__heading" data-reveal>
                    <span className="eyebrow">My Values</span>
                    <h2 className="section-title">Principles That Guide My Work</h2>
                </header>

                <ul className="values__list">
                    {values.map((item) => (
                        <li className="value-row" key={item.index}>
                            <span className="value-row__index" aria-hidden="true">
                                {item.index}
                            </span>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default Values;
