const slugify = require("slugify");
const { Blog, Newsletter } = require("../models");
const createCrudController = require("./crudControllerFactory");
const { sendMail } = require("../utils/email");
const { renderEmailTemplate } = require("../utils/emailTemplate");

const WORDS_PER_MINUTE = 200;
const CLIENT_URL = process.env.CLIENT_URL || "";

const withComputedFields = (body) => {
  if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });
  if (body.content) {
    const words = body.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    body.readTime = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  }
  if (body.status === "published" && !body.publishedAt) {
    body.publishedAt = new Date();
  }
  return body;
};

// Emails every active subscriber once, the moment a post first goes live —
// never on later edits to an already-published post, and never twice for
// the same publish event (guarded by the isNew/previousStatus transition
// check in notifyIfNewlyPublished below, not by resending here).
const notifySubscribersOfNewPost = async (blog) => {
  const subscribers = await Newsletter.findAll({ where: { status: "subscribed" } });
  if (subscribers.length === 0) return;

  const postUrl = `${CLIENT_URL}/blog/${blog.slug}`;
  const bodyHtml = `
    <p style="margin:0 0 14px;">A new post just went live:</p>
    <h2 style="margin:0 0 10px;font-size:18px;">${blog.title}</h2>
    ${blog.excerpt ? `<p style="margin:0 0 18px;color:#555;">${blog.excerpt}</p>` : ""}
    <p style="margin:0;">
      <a href="${postUrl}" style="display:inline-block;padding:12px 22px;background:#6C63FF;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;">Read the post</a>
    </p>
  `;
  const html = renderEmailTemplate({
    preheader: blog.excerpt || blog.title,
    heading: "New blog post published",
    bodyHtml,
  });
  const text = `New post: ${blog.title}\n${blog.excerpt || ""}\n\nRead it here: ${postUrl}`;

  // Settled, not all -- one bad subscriber address must never stop the rest
  // of the batch from being emailed.
  await Promise.allSettled(
    subscribers.map((sub) =>
      sendMail({
        to: sub.email,
        subject: `New post: ${blog.title}`,
        html,
        text,
        category: "blog_subscriber",
      })
    )
  );
};

const notifyIfNewlyPublished = async (blog, { isNew, previousStatus }) => {
  const justPublished = blog.status === "published" && (isNew || previousStatus !== "published");
  if (!justPublished) return;
  await notifySubscribersOfNewPost(blog);
};

module.exports = createCrudController(Blog, {
  searchFields: ["title", "category", "excerpt"],
  orderBy: "id",
  fileFields: ["coverImage"],
  jsonFields: ["tags"],
  beforeSave: withComputedFields,
  afterSave: notifyIfNewlyPublished,
});
