import {
  servicesApi,
  skillsApi,
  educationApi,
  experienceApi,
  certificatesApi,
  achievementsApi,
  testimonialsApi,
} from "../api";

/**
 * Each config drives DataTable columns + the create/edit modal form for
 * modules simple enough to share one generic page (CrudPage.jsx).
 * Projects, Blogs, Messages, SEO, Theme, and Settings have bespoke pages
 * because their fields/behaviour diverge too much to templatize cleanly.
 *
 * field.type: text | textarea | number | select | image | tags | checkbox | date
 */
export const crudConfigs = {
  services: {
    api: servicesApi,
    title: "Services",
    subtitle: "Manage the services you offer on your portfolio.",
    searchPlaceholder: "Search services…",
    emptyMessage: "No services yet. Add your first one.",
    fileField: "image",
    columns: [
      { key: "title", label: "Service", type: "thumb-title", sub: "price" },
      { key: "order", label: "Order" },
      { key: "status", label: "Status", type: "status-badge" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "image", label: "Icon / Image", type: "image" },
      { name: "icon", label: "Icon (upload, URL, or react-icon name)", type: "icon", placeholder: "e.g. FiCode" },
      { name: "price", label: "Price / Rate", type: "text", placeholder: "e.g. Starting at $499" },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        default: "active",
      },
      { name: "description", label: "Description", type: "textarea", required: true, span: 2 },
      { name: "features", label: "Features (comma-separated)", type: "tags", span: 2 },
    ],
  },

  skills: {
    api: skillsApi,
    title: "Skills",
    subtitle: "Manage your technical skillset and proficiency levels.",
    searchPlaceholder: "Search skills…",
    emptyMessage: "No skills added yet.",
    fileField: "icon",
    columns: [
      { key: "name", label: "Skill" },
      { key: "category", label: "Category" },
      { key: "proficiency", label: "Proficiency", type: "progress" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Skill name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true, placeholder: "e.g. Frontend" },
      { name: "icon", label: "Icon (upload, URL, or react-icon name)", type: "icon", placeholder: "e.g. FaReact" },
      { name: "proficiency", label: "Proficiency (0-100)", type: "number", default: 50, min: 0, max: 100 },
      { name: "order", label: "Sort order", type: "number", default: 0 },
    ],
  },

  education: {
    api: educationApi,
    title: "Education",
    subtitle: "Manage your academic background.",
    searchPlaceholder: "Search education…",
    emptyMessage: "No education records yet.",
    columns: [
      { key: "degree", label: "Degree", type: "thumb-title", sub: "institute" },
      { key: "session", label: "Session" },
      { key: "marks", label: "Marks" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "institute", label: "Institute", type: "text", required: true, span: 2 },
      { name: "degree", label: "Degree", type: "text", required: true },
      { name: "session", label: "Session", type: "text", placeholder: "e.g. 2019 - 2023" },
      { name: "marks", label: "Marks / Grade", type: "text" },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },

  experience: {
    api: experienceApi,
    title: "Experience",
    subtitle: "Manage the Learning Journey / experience preview shown on the Home page.",
    searchPlaceholder: "Search experience…",
    emptyMessage: "No experience entries yet.",
    columns: [
      { key: "title", label: "Title", type: "thumb-title", sub: "company" },
      { key: "year", label: "Year" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "company", label: "Company / Context", type: "text" },
      { name: "year", label: "Year", type: "text", placeholder: "e.g. 2024 - Present" },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },

  certificates: {
    api: certificatesApi,
    title: "Certificates",
    subtitle: "Manage your certifications and credentials.",
    searchPlaceholder: "Search certificates…",
    emptyMessage: "No certificates yet.",
    fileField: "image",
    columns: [
      { key: "title", label: "Certificate", type: "thumb-title", sub: "issuer" },
      { key: "issueDate", label: "Issued", type: "date" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "image", label: "Certificate image", type: "image" },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "e.g. Course, Certification, Bootcamp" },
      { name: "issueDate", label: "Issue date", type: "date" },
      { name: "credentialUrl", label: "Credential URL", type: "text", span: 2 },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      { name: "description", label: "Description (shown on details page)", type: "textarea", span: 2 },
    ],
  },

  achievements: {
    api: achievementsApi,
    title: "Achievements",
    subtitle: "Highlight awards, milestones, and recognitions.",
    searchPlaceholder: "Search achievements…",
    emptyMessage: "No achievements yet.",
    fileField: "image",
    columns: [
      { key: "title", label: "Achievement", type: "thumb-title", sub: "category" },
      { key: "date", label: "Date", type: "date" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "image", label: "Thumbnail", type: "image" },
      { name: "category", label: "Category", type: "text", placeholder: "e.g. Award, Certification, Milestone" },
      { name: "date", label: "Date", type: "date" },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      { name: "briefDescription", label: "Brief description (shown on cards)", type: "textarea", span: 2 },
      { name: "description", label: "Full description (shown on details page)", type: "textarea", span: 2 },
      { name: "gallery", label: "Gallery image URLs (comma-separated)", type: "tags", span: 2 },
    ],
  },

  testimonials: {
    api: testimonialsApi,
    title: "Testimonials",
    subtitle: "Manage client & colleague reviews shown on your portfolio.",
    searchPlaceholder: "Search testimonials…",
    emptyMessage: "No testimonials yet.",
    fileField: "photo",
    columns: [
      { key: "name", label: "Name", type: "thumb-title", sub: "designation", imgKey: "photo" },
      { key: "rating", label: "Rating", type: "stars" },
      { key: "status", label: "Status", type: "status-badge" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text" },
      { name: "photo", label: "Photo", type: "image" },
      { name: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5, default: 5 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "published", label: "Published" },
          { value: "hidden", label: "Hidden" },
        ],
        default: "published",
      },
      { name: "order", label: "Sort order", type: "number", default: 0 },
      { name: "review", label: "Review", type: "textarea", required: true, span: 2 },
    ],
  },
};
