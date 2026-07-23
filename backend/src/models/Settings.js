const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Singleton table (always row id = 1) holding profile + site-wide assets.
const Settings = sequelize.define("Settings", {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  experience: { type: DataTypes.STRING, allowNull: true }, // e.g. "3+ Years"
  languages: { type: DataTypes.STRING, allowNull: true }, // e.g. "English, Hindi"
  careerObjective: { type: DataTypes.TEXT, allowNull: true },
  currentFocus: { type: DataTypes.JSON, defaultValue: [] }, // e.g. ["React", "Node.js", ...]
  // Long-form About-page text overrides. { myStory, futureVision, missionGoal }
  // Each is free text (paragraphs separated by a blank line). Left empty by
  // default so the page's polished fallback copy is used until an admin
  // fills these in.
  aboutContent: { type: DataTypes.JSON, defaultValue: {} },
  avatar: { type: DataTypes.STRING, allowNull: true },
  logo: { type: DataTypes.STRING, allowNull: true },
  favicon: { type: DataTypes.STRING, allowNull: true },
  resume: { type: DataTypes.STRING, allowNull: true },
  socialLinks: { type: DataTypes.JSON, defaultValue: {} }, // { github, linkedin, twitter, ... }
  // Drives the /open-source page's GitHub API integration. Kept separate
  // from socialLinks.github (which may be a full profile URL meant for the
  // footer/contact icons) so the Open Source page always has a clean
  // username to call the GitHub API with, editable independently.
  githubUsername: { type: DataTypes.STRING, allowNull: true },
  // Maintenance Mode -- when enabled, the public site shows a premium
  // "under maintenance" page instead of the normal routes (/admin/* stays
  // reachable so the admin can log back in and flip this off).
  maintenanceMode: { type: DataTypes.BOOLEAN, defaultValue: false },
  maintenanceMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "We're currently performing scheduled maintenance. We'll be back online shortly.",
  },
  maintenanceEndsAt: { type: DataTypes.DATE, allowNull: true }, // optional -- powers the countdown
  maintenanceSplineUrl: { type: DataTypes.STRING, allowNull: true }, // optional public Spline scene embed URL
  // Home-page Statistics section + Projects-page Project Statistics section.
  // { totalProjects, technologies, certifications, achievements, experience,
  //   happyClients, ongoingProjects, openSourceProjects, yearsExperience }
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      totalProjects: 20,
      technologies: 15,
      certifications: 5,
      achievements: 5,
      experience: 2,
      happyClients: 10,
      ongoingProjects: 2,
      openSourceProjects: 3,
      yearsExperience: 2,
    },
  },
  // Portfolio AI Assistant (retrieval-only -- see services/aiKnowledgeService.js).
  // Admin-configurable per your spec: enable/disable, name, avatar, welcome
  // message, suggested questions, and which content types to prioritize.
  aiEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  aiName: { type: DataTypes.STRING, defaultValue: "VP-ChatBot" },
  aiAvatar: { type: DataTypes.STRING, allowNull: true },
  aiStatus: { type: DataTypes.STRING, defaultValue: "Online" },
  aiWelcomeTitle: { type: DataTypes.STRING, defaultValue: "Welcome to VP-ChatBot ✨" },
  aiWelcomeMessage: {
    type: DataTypes.TEXT,
    defaultValue:
      "I'm powered by Vishal's portfolio database and can instantly answer questions about his work, technical skills, case studies, and professional journey.",
  },
  aiPlaceholder: { type: DataTypes.STRING, defaultValue: "Ask me anything about my portfolio..." },
  aiEmptyChatMessage: {
    type: DataTypes.STRING,
    defaultValue: "Start a conversation with VP-ChatBot to explore my portfolio.",
  },
  aiTypingIndicatorText: { type: DataTypes.STRING, defaultValue: "VP-ChatBot is thinking..." },
  // Appearance
  aiThemeColor: { type: DataTypes.STRING, defaultValue: "#7c5cff" },
  aiAccentColor: { type: DataTypes.STRING, defaultValue: "#00e5ff" },
  aiBubbleStyle: { type: DataTypes.STRING, defaultValue: "rounded" }, // rounded | sharp | minimal
  // Behaviour
  aiTypingSpeed: { type: DataTypes.STRING, defaultValue: "natural" }, // slow | natural | fast
  aiResponseDelay: { type: DataTypes.INTEGER, defaultValue: 600 }, // ms "thinking" pause before typing starts
  aiTypingAnimationEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  aiSuggestedQuestions: {
    type: DataTypes.JSON,
    defaultValue: [
      "What are your skills?",
      "Tell me about your experience",
      "Show me your projects",
      "How can I contact you?",
    ],
  },
  // Order = priority when a query's intent is ambiguous across types.
  aiSearchPriority: {
    type: DataTypes.JSON,
    defaultValue: [
      "about",
      "project",
      "skill",
      "experience",
      "education",
      "service",
      "certificate",
      "achievement",
      "testimonial",
      "blog",
      "gallery",
      "contact",
    ],
  },
});

module.exports = Settings;
