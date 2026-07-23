require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, Admin, Settings, Theme, Education, Experience } = require("../models");

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const email = process.env.ADMIN_EMAIL || "admin@vishalmall.dev";
  const existing = await Admin.findOne({ where: { email } });
  if (!existing) {
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
    await Admin.create({
      name: process.env.ADMIN_NAME || "Vishal Mall",
      email,
      password,
      role: "owner",
    });
    console.log(`✔ Created admin login: ${email}`);
  } else {
    console.log(`• Admin ${email} already exists — skipping.`);
  }

  // Site settings / profile (singleton)
  await Settings.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      name: "Vishal Mall",
      email,
      role: "Java Full Stack Developer",
      phone: "+91 8419073041",
      address: "Medanipur, Ghughali, Maharajganj, Uttar Pradesh, 273151, India",
      socialLinks: {
        linkedin: "https://www.linkedin.com/in/vishal-mall-536506302/",
        github: "https://github.com/vishalmall8419",
      },
    },
  });

  await Theme.findOrCreate({ where: { id: 1 } });

  const educationRows = [
    { institute: "Sachidanand Inter College", degree: "Class 10", order: 0 },
    { institute: "Sachidanand Inter College", degree: "Class 12", order: 1 },
    { institute: "Mahamaya Polytechnic of Information Technology", degree: "Diploma", order: 2 },
    { institute: "Shrinath Ji Institute for Technical Education", degree: "B.Tech", order: 3 },
  ];
  for (const row of educationRows) {
    await Education.findOrCreate({ where: { institute: row.institute, degree: row.degree }, defaults: row });
  }

  // Experience / Learning Journey (Home page preview)
  const experienceRows = [
    {
      year: "2025 - Present",
      title: "B.Tech Student",
      company: "Shrinath Ji Institute for Technical Education",
      description:
        "Learning advanced software engineering, data structures, algorithms and full stack development while building real-world projects.",
      order: 0,
    },
    {
      year: "2024 - Present",
      title: "Java Full Stack Developer",
      company: "Self Learning Journey",
      description:
        "Building scalable applications using Java, Spring Boot, React, Node.js and MySQL while continuously improving problem solving skills.",
      order: 1,
    },
    {
      year: "2023 - 2024",
      title: "Frontend Development",
      company: "Personal Projects",
      description:
        "Created responsive websites, dashboards and UI components using HTML, CSS, JavaScript, Bootstrap, Tailwind CSS and React.",
      order: 2,
    },
    {
      year: "2022 - 2023",
      title: "Programming Foundation",
      company: "Learning Phase",
      description:
        "Started programming journey with Java, SQL, OOP, Data Structures and developed multiple academic projects.",
      order: 3,
    },
  ];
  for (const row of experienceRows) {
    await Experience.findOrCreate({ where: { title: row.title, year: row.year }, defaults: row });
  }

  console.log("✔ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("✘ Seed failed:", err);
  process.exit(1);
});
