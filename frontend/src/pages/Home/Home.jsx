import Navbar from "../../components/Navbar";
import Hero from "../../components/sections/Hero/Hero";
import About from "../../components/sections/About/About";
import Services from "../../components/sections/Services/Services";
import Skills from "../../components/sections/Skills/Skills";
import Projects from "../../components/sections/Projects/Projects";
import GalleryPreview from "../../components/sections/GalleryPreview/GalleryPreview";
import Education from "../../components/sections/Education/Education";
import Experience from "../../components/sections/Experience/Experience";
import Certificates from "../../components/sections/Certificates/Certificates";
import Achievements from "../../components/sections/Achievements/Achievements";
import Testimonials from "../../components/sections/Testimonials/Testimonials";
import Blog from "../../components/sections/Blog/Blog";
import Contact from "../../components/sections/Contact/Contact";
import Footer from "../../components/Footer/Footer";
import Marquee from "../../components/Marquee/Marquee";
import ScrollProgress from "../../components/ScrollProgress/ScrollProgress";
import SocialDock from "../../components/SocialDock/SocialDock";
import MouseGlow from "../../components/MouseGlow/MouseGlow";
import PageTransition from "../../components/PageTransition/PageTransition";
import StatsCounter from "../../components/StatsCounter/StatsCounter";
import TechStack from "../../components/TechStack/TechStack";
import FAQ from "../../components/sections/FAQ/FAQ";
import CTA from "../../components/sections/CTA/CTA";
import useSeo from "../../hooks/useSeo";

function Home() {
  useSeo("home", {
    title: "Vishal Mall — Full Stack Developer",
    description: "Portfolio of Vishal Mall, a Java Full Stack Developer building modern, scalable web applications.",
  });

  return (
    <PageTransition>
      <MouseGlow />
      <ScrollProgress />
      <SocialDock />
      <Navbar />
      <Hero />
      <Marquee />
      <StatsCounter />
      <About />
      <Services />
      <Skills />
      <TechStack />
      <Projects />
      <GalleryPreview />
      <Education />
      <Experience />
      <Certificates />
      <Achievements />
      <Testimonials />
      <FAQ />
      <Blog />
      <CTA />
      <Contact />
      <Footer />
    </PageTransition>
  );
}

export default Home;