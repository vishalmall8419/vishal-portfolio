const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Memory storage: files stay as in-memory buffers just long enough to be
// streamed straight to Cloudinary — nothing ever touches local disk, so
// this can't collide with (or fall back to) the existing /uploads folder.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return cb(new ApiError(400, "Unsupported file type. Only jpg, png, webp or gif images are allowed."));
  }
  cb(null, true);
};

const galleryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
});

// Admin Settings uploads (logo / favicon / avatar / resume). Same
// memory-storage approach as gallery — nothing touches local disk — but the
// allowed types are wider: settings assets also accept SVG (favicons/logos
// are often SVG) and, only for the "resume" field, a PDF.
const SETTINGS_ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
const SETTINGS_ALLOWED_DOC_TYPES = new Set(["application/pdf"]);

const settingsFileFilter = (req, file, cb) => {
  const isResumeField = file.fieldname === "resume";
  const isAllowedImage = SETTINGS_ALLOWED_IMAGE_TYPES.has(file.mimetype);
  const isAllowedDoc = SETTINGS_ALLOWED_DOC_TYPES.has(file.mimetype);

  if (isResumeField) {
    if (!isAllowedDoc) return cb(new ApiError(400, "The resume must be a PDF file."));
    return cb(null, true);
  }
  if (!isAllowedImage) {
    return cb(new ApiError(400, "Unsupported file type. Only jpg, png, webp, svg or gif images are allowed."));
  }
  cb(null, true);
};

const settingsUpload = multer({
  storage,
  fileFilter: settingsFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — matches the previous disk-storage limit
});

/**
 * Streams a single in-memory file buffer to Cloudinary.
 * Returns { url, publicId } (url = secure_url).
 *
 * `options.resourceType` lets callers upload non-image files (e.g. the
 * settings "resume" PDF) as Cloudinary's "raw" resource type. The
 * image-optimization transformation only makes sense for actual images, so
 * it's skipped whenever resourceType isn't "image".
 */
function uploadBufferToCloudinary(buffer, folder, options = {}) {
  const { resourceType = "image" } = options;
  return new Promise((resolve, reject) => {
    const uploadOptions = { folder, resource_type: resourceType };
    if (resourceType === "image") {
      // Auto-optimized delivery: best format for the requesting browser
      // (e.g. WebP/AVIF) at good-quality compression, capped so nobody
      // accidentally serves a multi-megapixel original on a card grid.
      uploadOptions.transformation = [{ quality: "auto:good", fetch_format: "auto", width: 2000, crop: "limit" }];
    }
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) return reject(err);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

/** Picks the right Cloudinary resource_type for a multer file based on its mimetype. */
function resolveSettingsResourceType(mimetype) {
  return SETTINGS_ALLOWED_DOC_TYPES.has(mimetype) ? "raw" : "image";
}

/** Uploads every file in `files` (multer's in-memory array) to Cloudinary in parallel. */
async function uploadManyToCloudinary(files = [], folder) {
  return Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer, folder)));
}

/** Best-effort delete — never throws, so a stale/missing asset can't block a DB write. */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Cloudinary delete failed for ${publicId}:`, err.message);
  }
}

module.exports = {
  galleryUpload,
  settingsUpload,
  uploadBufferToCloudinary,
  uploadManyToCloudinary,
  deleteFromCloudinary,
  resolveSettingsResourceType,
};