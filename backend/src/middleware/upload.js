const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]);
const ALLOWED_DOC_TYPES = new Set(["application/pdf"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
  const isDoc = ALLOWED_DOC_TYPES.has(file.mimetype);
  if (!isImage && !isDoc) {
    return cb(new ApiError(400, "Unsupported file type. Only images (jpg, png, webp, svg, gif) or PDF are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload, UPLOAD_DIR };
