const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");
const { UPLOAD_DIR } = require("./middleware/upload");

const app = express();

// Trust the first proxy hop (needed for correct client IPs / secure cookies
// behind a reverse proxy such as Nginx or a PaaS load balancer).
app.set("trust proxy", 1);

app.use(
  helmet({
    // Cross-origin uploads (images used as <img src>) need this relaxed.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CLIENT_URL can be a single origin or a comma-separated list (e.g. local
// dev + the deployed Vercel URL), so production doesn't need code changes
// to allow more than one frontend origin.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin requests / non-browser tools (curl, health checks) send
      // no Origin header at all -- always allow those.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use("/api", apiLimiter);

// Serves uploaded images/resume/etc. Frontend reads these via FILE_BASE_URL + path.
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

app.get("/health", (req, res) => res.json({ success: true, status: "ok", time: new Date().toISOString() }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
