import { useLayoutEffect } from "react";
import { gsap } from "../../../lib/gsap";

/**
 * Fades + slides up every element matching `selector` inside `containerRef`
 * the first time the container scrolls into view. Scoped with gsap.context
 * so it's safe under React StrictMode and cleans up on unmount.
 */
export default function useScrollReveal(containerRef, options = {}) {
    const {
        selector = "[data-reveal]",
        y = 36,
        duration = 1,
        stagger = 0.12,
        start = "top 78%",
    } = options;

    useLayoutEffect(() => {
        if (!containerRef.current) return undefined;

        const ctx = gsap.context(() => {
            const targets = gsap.utils.toArray(selector);
            if (!targets.length) return;

            gsap.set(targets, { autoAlpha: 0, y });

            gsap.to(targets, {
                autoAlpha: 1,
                y: 0,
                duration,
                stagger,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start,
                    once: true,
                },
            });
        }, containerRef);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef]);
}
