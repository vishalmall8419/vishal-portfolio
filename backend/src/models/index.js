const sequelize = require("../config/db");

const Admin = require("./Admin");
const Project = require("./Project");
const Blog = require("./Blog");
const Service = require("./Service");
const Skill = require("./Skill");
const Education = require("./Education");
const Experience = require("./Experience");
const Certificate = require("./Certificate");
const Achievement = require("./Achievement");
const Testimonial = require("./Testimonial");
const Gallery = require("./Gallery");
const Message = require("./Message");
const Newsletter = require("./Newsletter");
const Seo = require("./Seo");
const Settings = require("./Settings");
const Theme = require("./Theme");
const Notification = require("./Notification");
const AdminOtp = require("./AdminOtp");
const EmailLog = require("./EmailLog");

// No cross-entity foreign keys are needed for this schema — every module is
// independent content managed by the single Admin. Kept here as the one
// place future relations (e.g. Blog.belongsTo(Category)) would be declared.

module.exports = {
  sequelize,
  Admin,
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
  Message,
  Newsletter,
  Seo,
  Settings,
  Theme,
  Notification,
  AdminOtp,
  EmailLog,
};
