import { useLayoutEffect, useRef } from "react";
import journey from "../data/journey";
import { gsap } from "../../../lib/gsap";

function Journey() {
    const rootRef = useRef(null);
    const pinRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray(".journey-card");
            const markers = gsap.utils.toArray(".journey__markers li");
            const total = cards.length;

            if (!total) return;

            // Initial state — only the first card is visible.
            gsap.set(cards, {
                autoAlpha: 0,
                y: 70,
                scale: 0.9,
                filter: "blur(10px)",
                visibility: "hidden",
            });
            gsap.set(cards[0], {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                visibility: "visible",
            });
            gsap.set(".journey__rail-fill", { height: `${(1 / total) * 100}%` });
            gsap.set(".journey__rail-dot", { bottom: `${(1 / total) * 100}%` });
            if (markers[0]) markers[0].classList.add("is-active");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                    pin: pinRef.current,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const activeIndex = Math.min(
                            total - 1,
                            Math.floor(self.progress * total)
                        );
                        markers.forEach((marker, i) =>
                            marker.classList.toggle("is-active", i === activeIndex)
                        );
                    },
                },
            });

            cards.forEach((card, index) => {
                if (index !== 0) {
                    // Previous card recedes — fades, lifts, blurs — while the
                    // next one arrives from below. Overlapped for a true
                    // cross-dissolve rather than a hard cut.
                    tl.to(
                        cards[index - 1],
                        {
                            autoAlpha: 0,
                            y: -70,
                            scale: 0.9,
                            filter: "blur(10px)",
                            duration: 1,
                            ease: "power2.inOut",
                        },
                        `card-${index}`
                    ).fromTo(
                        card,
                        {
                            autoAlpha: 0,
                            y: 70,
                            scale: 0.9,
                            filter: "blur(10px)",
                            visibility: "visible",
                        },
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                            duration: 1,
                            ease: "power2.out",
                        },
                        `card-${index}`
                    );

                    tl.to(
                        ".journey__rail-fill",
                        { height: `${((index + 1) / total) * 100}%`, duration: 1, ease: "none" },
                        `card-${index}`
                    ).to(
                        ".journey__rail-dot",
                        { bottom: `${((index + 1) / total) * 100}%`, duration: 1, ease: "none" },
                        `card-${index}`
                    );
                }

                // Reading pause so the card holds still before the next shift.
                if (index !== cards.length - 1) {
                    tl.to({}, { duration: 0.9 });
                }
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="journey" aria-label="My journey timeline" ref={rootRef}>
            <span className="journey__ghost-word" aria-hidden="true">
                Journey
            </span>

            <div className="journey__pin" ref={pinRef}>
                <div className="shell journey__layout">
                    <header className="journey__intro">
                        <span className="eyebrow">My Journey</span>
                        <h2 className="section-title">
                            Every Step
                            <br />
                            Built My  Future.
                        </h2>
                        <p>
                            Scroll to move through the timeline.
                        </p>

                        <div className="journey__progress" aria-hidden="true">
                            <div className="journey__rail">
                                <div className="journey__rail-fill" />
                                <div className="journey__rail-dot" />
                            </div>
                            <ol className="journey__markers">
                                {journey.map((item) => (
                                    <li key={item.year}>{item.year}</li>
                                ))}
                            </ol>
                        </div>
                    </header>

                    <div className="journey__stage">
                        {journey.map((item, index) => (
                            <article
                                className="journey-card"
                                key={item.year}
                                data-index={index}
                            >
                                <span className="journey-card__year">{item.year}</span>
                                <span className="journey-card__label">{item.label}</span>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Journey;
