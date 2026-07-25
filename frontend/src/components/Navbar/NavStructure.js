// Groups every existing route into the slimmed-down navbar: a few direct
// links plus two premium dropdowns ("Explore" and "More"). Every page that
// used to live in the flat NavLinks list is still reachable here — nothing
// was removed, only reorganized. Add new pages to one of these groups
// rather than growing the top-level list again.

const NavStructure = [
  {
    id: "home",
    type: "link",
    title: "Home",
    path: "/",
  },
  {
    id: "about",
    type: "link",
    title: "About",
    path: "/about",
  },
  {
    id: "explore",
    type: "dropdown",
    title: "Explore",
    items: [
      { id: "skills", title: "Skills", path: "/skills", description: "Tech stack & proficiency" },
      { id: "projects", title: "Projects", path: "/projects", description: "Featured case studies" },
      { id: "gallery", title: "Gallery", path: "/gallery", description: "Moments & behind the scenes" },
      { id: "blog", title: "Blog", path: "/blog", description: "Writing & notes" },
      { id: "open-source", title: "Open Source", path: "/open-source", description: "Public contributions" },
    ],
  },
  {
    id: "more",
    type: "dropdown",
    title: "More",
    items: [
      { id: "services", title: "Services", path: "/services", description: "What I offer" },
      { id: "resume", title: "Resume", path: "/resume", description: "Download my CV" },
      { id: "certificates", title: "Certificates", path: "/certificates", description: "Courses & credentials" },
      { id: "achievements", title: "Achievements", path: "/achievements", description: "Awards & milestones" },
      { id: "contact", title: "Contact", path: "/contact", description: "Get in touch" },
    ],
  },
];

export default NavStructure;
