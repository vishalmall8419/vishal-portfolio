// Flat list kept for any code that still wants every page in one array
// (e.g. sitemaps, search indexing) — the Navbar itself now renders from
// NavStructure below, which groups these same routes into dropdowns.
const NavLinks = [
  {
    id: 1,
    title: "Home",
    path: "/",
  },
  {
    id: 2,
    title: "About",
    path: "/about",
  },
  {
    id: 3,
    title: "Skills",
    path: "/skills",
  },
  {
    id: 4,
    title: "Projects",
    path: "/projects",
  },
  {
    id: 5,
    title: "Gallery",
    path: "/gallery",
  },
  {
    id: 6,
    title: "Services",
    path: "/services",
  },
  {
    id: 7,
    title: "Blog",
    path: "/blog",
  },
  {
    id: 10,
    title: "Open Source",
    path: "/open-source",
  },
  {
    id: 8,
    title: "Contact",
    path: "/contact",
  },
  {
    id: 9,
    title: "Resume",
    path: "/resume",
  },
  {
    id: 11,
    title: "Certificates",
    path: "/certificates",
  },
  {
    id: 12,
    title: "Achievements",
    path: "/achievements",
  },
  {
    id: 13,
    title: "VP-ChatBot",
    path: "/ai",
  },
];

export default NavLinks;