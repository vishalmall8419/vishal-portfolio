import "./Abouts.css";
import Navbar from "../../components/Navbar";
import Hero from "./components/Hero";
import WhoIAm from "./components/WhoIAm";
import Journey from "./components/Journey";
import Philosophy from "./components/Philosophy";
import Vision from "./components/Vision";
import GramNirman from "./components/GramNirman";
import Values from "./components/Values";
import CallToAction from "./components/CallToAction";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";


function About() {
    useSeo("about", {
        title: "About — Vishal Mall",
        description: "Learn more about Vishal Mall's journey, philosophy, and approach to building software.",
    });

    return (
        <>
        <main className="about-page">
            <Navbar />
            <Hero />
            <WhoIAm />
            <Journey />
            <Philosophy />
            <Vision />
            <GramNirman />
            <Values />
            <CallToAction />
        </main>
        <Footer />
        </>
    );
}

export default About;
