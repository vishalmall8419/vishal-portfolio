import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Consistent, premium easing used across the page.
    gsap.defaults({
        ease: "power3.out",
    });
}

export { gsap, ScrollTrigger };
