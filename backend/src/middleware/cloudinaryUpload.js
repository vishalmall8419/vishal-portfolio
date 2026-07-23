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

/**
 * Streams a single in-memory file buffer to Cloudinary.
 * Returns { url, publicId } (url = secure_url).
 */
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Auto-optimized delivery: best format for the requesting browser
        // (e.g. WebP/AVIF) at good-quality compression, capped so nobody
        // accidentally serves a multi-megapixel original on a card grid.
        transformation: [{ quality: "auto:good", fetch_format: "auto", width: 2000, crop: "limit" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
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
  uploadBufferToCloudinary,
  uploadManyToCloudinary,
  deleteFromCloudinary,
};
