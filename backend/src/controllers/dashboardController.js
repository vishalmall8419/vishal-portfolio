const {
  Project,
  Blog,
  Service,
  Skill,
  Message,
  Testimonial,
  Newsletter,
} = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

const stats = asyncHandler(async (req, res) => {
  const [projects, blogs, services, skills, unreadMessages, testimonials, totalBlogViews, newsletterSubscribers] = await Promise.all([
    Project.count(),
    Blog.count(),
    Service.count(),
    Skill.count(),
    Message.count({ where: { isRead: false } }),
    Testimonial.count(),
    Blog.sum("views"),
    Newsletter.count({ where: { status: "subscribed" } }),
  ]);

  ok(res, {
    projects,
    blogs,
    services,
    skills,
    unreadMessages,
    testimonials,
    totalBlogViews: totalBlogViews || 0,
    newsletterSubscribers,
  });
});

const activity = asyncHandler(async (req, res) => {
  const [recentMessages, recentBlogs, recentProjects] = await Promise.all([
    Message.findAll({ order: [["createdAt", "DESC"]], limit: 5 }),
    Blog.findAll({ order: [["createdAt", "DESC"]], limit: 5, attributes: ["id", "title", "status", "createdAt"] }),
    Project.findAll({ order: [["createdAt", "DESC"]], limit: 5, attributes: ["id", "title", "status", "createdAt"] }),
  ]);

  ok(res, { recentMessages, recentBlogs, recentProjects });
});

module.exports = { stats, activity };
