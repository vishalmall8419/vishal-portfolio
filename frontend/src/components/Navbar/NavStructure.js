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
      { id: "skills", title: "Skills", path: "/skills"},
      { id: "projects", title: "Projects", path: "/projects"},
      { id: "gallery", title: "Gallery", path: "/gallery"},
      { id: "blog", title: "Blog", path: "/blog" },
      { id: "open-source", title: "Open Source", path: "/open-source" },
    ],
  },
  {
    id: "more",
    type: "dropdown",
    title: "More",
    items: [
      { id: "services", title: "Services", path: "/services"},
      { id: "resume", title: "Resume", path: "/resume" },
      { id: "certificates", title: "Certificates", path: "/certificates"},
      { id: "achievements", title: "Achievements", path: "/achievements"},
      { id: "contact", title: "Contact", path: "/contact" },
    ],
  },
];

export default NavStructure;
