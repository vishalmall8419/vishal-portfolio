import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Code-split every route so the initial bundle only ships Home + the shell —
// each other page (and the whole /admin/* tree) loads on demand instead of
// blocking first paint.
const Home = lazy(() => import("../pages/Home/Home"));
const About = lazy(() => import("../pages/About/About"));
const Skills = lazy(() => import("../pages/Skills/Skills"));
const Projects = lazy(() => import("../pages/Projects/Projects"));
const ProjectDetail = lazy(() => import("../pages/ProjectDetail/ProjectDetail"));
const GalleryPage = lazy(() => import("../pages/Gallery/Gallery"));
const GalleryDetail = lazy(() => import("../pages/GalleryDetail/GalleryDetail"));
const AllAchievements = lazy(() => import("../pages/Achievements/Achievements"));
const AchievementDetail = lazy(() => import("../pages/AchievementDetail/AchievementDetail"));
const AllTestimonials = lazy(() => import("../pages/Testimonials/Testimonials"));
const AllCertificates = lazy(() => import("../pages/Certificates/Certificates"));
const CertificateDetail = lazy(() => import("../pages/CertificateDetail/CertificateDetail"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Services = lazy(() => import("../pages/Services/Services"));
const ServiceDetail = lazy(() => import("../pages/ServiceDetail/ServiceDetail"));
const Blogs = lazy(() => import("../pages/Blogs/Blogs"));
const BlogPost = lazy(() => import("../pages/BlogPost/BlogPost"));
const HireMe = lazy(() => import("../pages/HireMe/HireMe"));
const OpenSource = lazy(() => import("../pages/OpenSource/OpenSource"));
const AI = lazy(() => import("../pages/AI/AI"));
const Resume = lazy(() => import("../pages/Resume/Resume"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const AdminRoutes = lazy(() => import("../admin/routes/AdminRoutes"));

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted, #888)",
      }}
    >

    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/skills"
          element={<Skills />}
        />
        <Route
          path="/projects"
          element={<Projects />}
        />
        <Route
          path="/projects/:slug"
          element={<ProjectDetail />}
        />
        <Route
          path="/gallery"
          element={<GalleryPage />}
        />
        <Route
          path="/gallery/:slug"
          element={<GalleryDetail />}
        />
        <Route
          path="/services"
          element={<Services />}
        />
        <Route
          path="/achievements"
          element={<AllAchievements />}
        />
        <Route
          path="/achievements/:slug"
          element={<AchievementDetail />}
        />
        <Route
          path="/testimonials"
          element={<AllTestimonials />}
        />
        <Route
          path="/certificates"
          element={<AllCertificates />}
        />
        <Route
          path="/certificates/:slug"
          element={<CertificateDetail />}
        />
        <Route
          path="/services/:id"
          element={<ServiceDetail />}
        />
        <Route
          path="/blog"
          element={<Blogs />}
        />
        <Route
          path="/blog/:slug"
          element={<BlogPost />}
        />
        <Route
          path="/contact"
          element={<Profile />}
        />
        <Route
          path="/hire-me"
          element={<HireMe />}
        />
        <Route
          path="/open-source"
          element={<OpenSource />}
        />
        <Route
          path="/ai"
          element={<AI />}
        />
        <Route
          path="/resume"
          element={<Resume />}
        />

        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
