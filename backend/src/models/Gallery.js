const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Gallery = sequelize.define("Gallery", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  category: { type: DataTypes.STRING, allowNull: false }, // free text — admin can create unlimited categories
  shortDescription: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },

  // Cover image (Cloudinary secure_url) + its public_id, so it can be
  // deleted from Cloudinary when replaced or when the item is removed.
  image: { type: DataTypes.STRING, allowNull: true },
  imagePublicId: { type: DataTypes.STRING, allowNull: true },

  // Extra gallery/carousel images: [{ url, publicId }, ...]
  galleryImages: { type: DataTypes.JSON, defaultValue: [] },

  altText: { type: DataTypes.STRING, allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] }, // also doubles as "Technologies Used" on the details page

  projectLink: { type: DataTypes.STRING, allowNull: true },
  githubLink: { type: DataTypes.STRING, allowNull: true },

  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },
});

module.exports = Gallery;
