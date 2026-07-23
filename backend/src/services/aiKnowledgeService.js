// Portfolio AI Assistant -- retrieval engine.
//
// This is intentionally NOT a chatbot backed by an LLM. Every answer is
// built directly from what's already stored in the CMS (Settings, Projects,
// Skills, Experience, etc.) -- nothing is generated or guessed. If nothing
// in the database matches the question well enough, the assistant says so.
//
// Pipeline: normalize -> detect intent -> build/reuse corpus -> rank ->
// compose an answer only from the matched documents' own fields.

const {
  Project,
  Blog,
  Service,
  Skill,
  Education,
  Experience,
  Certificate,
  Achievement,
  Testimonial,
  Gallery,
  Settings,
} = require("../models");

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "your", "yours", "me", "my", "he", "she", "it", "we", "they",
  "do", "does", "did", "doing", "have", "has", "had", "having",
  "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
  "can", "could", "will", "would", "should", "of", "in", "on", "at", "to",
  "for", "with", "about", "as", "by", "and", "or", "but", "if", "then",
  "so", "than", "this", "that", "these", "those", "tell", "please", "show",
  "give", "some", "any", "there", "here", "up", "out", "just", "also",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

// 2. Intent detection -- simple keyword -> content-type map
const INTENT_KEYWORDS = {
  about: ["who", "about", "yourself", "bio", "introduce", "introduction", "vishal"],
  education: ["education", "degree", "college", "university", "study", "studied", "academic", "school"],
  skill: ["skill", "skills", "technology", "technologies", "tech", "stack", "proficient", "know", "language", "languages", "framework", "frameworks", "tool", "tools"],
  experience: ["experience", "work", "job", "career", "worked", "employer", "role", "position"],
  project: ["project", "projects", "built", "build", "app", "application", "portfolio", "case", "study"],
  certificate: ["certificate", "certificates", "certification", "certifications", "course", "courses"],
  achievement: ["achievement", "achievements", "award", "awards", "accomplishment", "accomplishments"],
  service: ["service", "services", "offer", "offers", "hire", "pricing", "price", "cost"],
  resume: ["resume", "cv", "download"],
  gallery: ["gallery", "photo", "photos", "picture", "pictures", "image", "images"],
  contact: ["contact", "email", "phone", "reach", "reach out", "message", "get in touch"],
  testimonial: ["testimonial", "testimonials", "review", "reviews", "feedback", "client", "clients", "recommend"],
  blog: ["blog", "blogs", "article", "articles", "post", "posts", "write", "writing"],
  timeline: ["timeline", "journey", "history"],
};

function detectIntent(tokens) {
  const scores = {};
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (tokens.includes(kw)) {
        scores[intent] = (scores[intent] || 0) + 1;
      }
    }
  }
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return ranked.length ? ranked[0][0] : null;
}

// 3. Corpus -- flatten every content module into searchable documents
const CACHE_TTL_MS = 2 * 60 * 1000; // short TTL -- admin edits should show up quickly
let corpusCache = { data: null, expiresAt: 0 };

async function buildCorpus() {
  if (corpusCache.data && Date.now() < corpusCache.expiresAt) return corpusCache.data;

  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  const [projects, blogs, services, skills, education, experience, certificates, achievements, testimonials, gallery] =
    await Promise.all([
      Project.findAll({ where: { status: "published" } }),
      Blog.findAll({ where: { status: "published" } }),
      Service.findAll({ where: { status: "active" } }),
      Skill.findAll(),
      Education.findAll(),
      Experience.findAll(),
      Certificate.findAll(),
      Achievement.findAll(),
      Testimonial.findAll({ where: { status: "published" } }),
      Gallery.findAll({ where: { status: "Active" } }),
    ]);

  const docs = [];

  // --- About / profile (from Settings) ---
  const aboutParts = [
    settingsRow.name && `Name: ${settingsRow.name}`,
    settingsRow.role && `Role: ${settingsRow.role}`,
    settingsRow.experience && `Experience: ${settingsRow.experience}`,
    settingsRow.languages && `Languages: ${settingsRow.languages}`,
    settingsRow.careerObjective,
    settingsRow.aboutContent?.myStory,
    settingsRow.aboutContent?.futureVision,
    settingsRow.aboutContent?.missionGoal,
    Array.isArray(settingsRow.currentFocus) && settingsRow.currentFocus.length
      ? `Currently focused on: ${settingsRow.currentFocus.join(", ")}`
      : null,
  ].filter(Boolean);
  if (aboutParts.length) {
    docs.push({
      type: "about",
      title: settingsRow.name || "About",
      content: aboutParts.join(" "),
      url: "/about",
    });
  }

  const contactParts = [
    settingsRow.email && `Email: ${settingsRow.email}`,
    settingsRow.phone && `Phone: ${settingsRow.phone}`,
    settingsRow.address && `Location: ${settingsRow.address}`,
  ].filter(Boolean);
  if (contactParts.length) {
    docs.push({ type: "contact", title: "Contact", content: contactParts.join(" "), url: "/contact" });
  }

  docs.push({
    type: "resume",
    title: "Resume",
    content: "You can view or download the full resume on the Resume page.",
    url: "/resume",
  });

  for (const e of education) {
    docs.push({
      type: "education",
      title: `${e.degree} — ${e.institute}`,
      content: [e.degree, e.institute, e.session, e.marks, e.description].filter(Boolean).join(" | "),
      url: "/about",
    });
  }

  for (const s of skills) {
    docs.push({
      type: "skill",
      title: s.name,
      content: `${s.name} (${s.category || "skill"}${s.proficiency ? `, ${s.proficiency}% proficiency` : ""})`,
      url: "/skills",
    });
  }

  for (const x of experience) {
    docs.push({
      type: "experience",
      title: `${x.title} — ${x.company}`,
      content: [x.title, x.company, x.year, x.description].filter(Boolean).join(" | "),
      url: "/about",
    });
  }

  for (const p of projects) {
    docs.push({
      type: "project",
      title: p.title,
      content: [
        p.title,
        p.shortDescription,
        p.description,
        Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies,
      ]
        .filter(Boolean)
        .join(" | "),
      url: `/projects/${p.slug}`,
    });
  }

  for (const c of certificates) {
    docs.push({
      type: "certificate",
      title: c.title,
      content: [c.title, c.issuer, c.issueDate, c.description].filter(Boolean).join(" | "),
      url: `/certificates/${c.slug}`,
    });
  }

  for (const a of achievements) {
    docs.push({
      type: "achievement",
      title: a.title,
      content: [a.title, a.briefDescription, a.description].filter(Boolean).join(" | "),
      url: `/achievements/${a.slug}`,
    });
  }

  for (const s of services) {
    docs.push({
      type: "service",
      title: s.title,
      content: [s.title, s.description, s.price && `Price: ${s.price}`, Array.isArray(s.features) ? s.features.join(", ") : null]
        .filter(Boolean)
        .join(" | "),
      url: `/services/${s.id}`,
    });
  }

  for (const t of testimonials) {
    docs.push({
      type: "testimonial",
      title: `${t.name}${t.designation ? ` — ${t.designation}` : ""}`,
      content: [t.review, t.name, t.designation].filter(Boolean).join(" | "),
      url: "/testimonials",
    });
  }

  for (const b of blogs) {
    docs.push({
      type: "blog",
      title: b.title,
      content: [b.title, b.excerpt, Array.isArray(b.tags) ? b.tags.join(", ") : null].filter(Boolean).join(" | "),
      url: `/blog/${b.slug}`,
    });
  }

  for (const g of gallery) {
    docs.push({
      type: "gallery",
      title: g.title,
      content: [g.title, g.shortDescription, g.category].filter(Boolean).join(" | "),
      url: `/gallery/${g.slug}`,
    });
  }

  // Pre-tokenize once so every search doesn't re-tokenize the whole corpus.
  for (const doc of docs) {
    doc.titleTokens = tokenize(doc.title);
    doc.contentTokens = tokenize(doc.content);
  }

  corpusCache = { data: docs, expiresAt: Date.now() + CACHE_TTL_MS };
  return docs;
}

function invalidateCorpusCache() {
  corpusCache = { data: null, expiresAt: 0 };
}

// 4 & 5. Rank + score -- plain keyword overlap, title weighted higher,
// with an intent-match boost. No embeddings, no external calls.
function scoreDoc(queryTokens, intent, priorityIndex, doc) {
  let score = 0;
  for (const qt of queryTokens) {
    if (doc.titleTokens.includes(qt)) score += 3;
    if (doc.contentTokens.includes(qt)) score += 1;
  }
  if (intent && doc.type === intent) score += 5;
  // Small tie-breaker nudge from the admin's configured priority order.
  if (priorityIndex >= 0) score += Math.max(0, 3 - priorityIndex * 0.2);
  return score;
}

async function search(rawQuery, { limit = 5 } = {}) {
  const queryTokens = tokenize(rawQuery);
  const intent = detectIntent(queryTokens);
  const docs = await buildCorpus();

  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  const priority = Array.isArray(settingsRow.aiSearchPriority) ? settingsRow.aiSearchPriority : [];

  const scored = docs
    .map((doc) => ({
      doc,
      score: scoreDoc(queryTokens, intent, priority.indexOf(doc.type), doc),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { intent, results: scored };
}

// 6/7/8. Compose an answer strictly from the retrieved documents. Never
// invents anything not already in `results`.
const NOT_FOUND = "I couldn't find that information.";

function composeAnswer(query, { intent, results }) {
  if (!results.length) {
    return { answer: NOT_FOUND, sources: [] };
  }

  // Group top results by type so e.g. a "skills" question lists several
  // skills instead of just the single highest-scoring one.
  const byType = {};
  for (const { doc } of results) {
    (byType[doc.type] = byType[doc.type] || []).push(doc);
  }
  const primaryType = intent && byType[intent] ? intent : results[0].doc.type;
  const primaryDocs = byType[primaryType];

  let answer;
  switch (primaryType) {
    case "about":
      answer = primaryDocs[0].content;
      break;
    case "contact":
      answer = `You can reach out here: ${primaryDocs[0].content}`;
      break;
    case "resume":
      answer = primaryDocs[0].content;
      break;
    case "skill":
      answer = `Here are some relevant skills: ${primaryDocs.map((d) => d.title).join(", ")}.`;
      break;
    case "education":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "experience":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "project":
      answer = primaryDocs
        .map((d) => `• ${d.title}${d.content.split(" | ")[1] ? ` — ${d.content.split(" | ")[1]}` : ""}`)
        .join("\n");
      break;
    case "certificate":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "achievement":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "service":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "testimonial":
      answer = primaryDocs.map((d) => `"${d.content.split(" | ")[0]}" — ${d.title}`).join("\n\n");
      break;
    case "blog":
      answer = primaryDocs.map((d) => `• ${d.title}`).join("\n");
      break;
    case "gallery":
      answer = `Found in the gallery: ${primaryDocs.map((d) => d.title).join(", ")}.`;
      break;
    default:
      answer = primaryDocs[0].content;
  }

  return {
    answer,
    sources: primaryDocs.slice(0, 5).map((d) => ({ type: d.type, title: d.title, url: d.url })),
  };
}

async function ask(rawQuery) {
  const trimmed = String(rawQuery || "").trim();
  if (!trimmed) return { answer: NOT_FOUND, sources: [] };

  const { intent, results } = await search(trimmed);
  return composeAnswer(trimmed, { intent, results });
}

module.exports = { ask, search, buildCorpus, invalidateCorpusCache, NOT_FOUND };
