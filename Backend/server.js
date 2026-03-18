import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

/* =======================
   🔧 Configurations
======================= */

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Email Verification
const verifyEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing!");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Email Error:", error.message);
    } else {
      console.log("✅ Email ready");
    }
  });

  return true;
};

/* =======================
   📦 Imports (Routes)
======================= */

import authRoutes from "./routes/auth.Routes.js";
import productRoutes from "./routes/product.Routes.js";
import newsletterRoutes from "./routes/newsletter.Routes.js";
import heroRoutes from "./routes/hero.Routes.js";
import cartRoutes from "./routes/cart.Routes.js";
import orderRoutes from "./routes/order.Routes.js";
import paymentRoutes from "./routes/payment.Routes.js";
import brandRoutes from "./routes/brand.Routes.js";
import contactRoutes from "./routes/contact.Routes.js";
import faqRoutes from "./routes/faq.Routes.js";
import adminRoutes from "./routes/admin.Routes.js";
import chatRoutes from "./routes/chat.Routes.js";

/* =======================
   📁 Path Setup
======================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =======================
   🚀 App Init
======================= */

const app = express();
const PORT = process.env.PORT || 5000;
const serverStartTime = new Date();

/* =======================
   🌐 CORS Setup
======================= */

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "https://maurmart.vercel.app",
  "https://maurmart.onrender.com",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* =======================
   🧩 Middlewares
======================= */

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   ❤️ Health Check API
======================= */

app.get("/health", (req, res) => {
  const uptimeSeconds = process.uptime();

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const emailConfigured =
    process.env.EMAIL_USER && process.env.EMAIL_PASS ? true : false;

  res.status(200).json({
    status: "OK",

    time: {
      iso: new Date().toISOString(),
      local: new Date().toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverStartTime: serverStartTime.toISOString(),
    },

    uptime: {
      seconds: uptimeSeconds,
      human: formatUptime(uptimeSeconds),
    },

    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },

    system: {
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      cpuCores: os.cpus().length,
      loadAverage: os.loadavg(),
    },

    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      freeSystemMemory: os.freemem(),
      totalSystemMemory: os.totalmem(),
    },

    services: {
      database: dbStatusMap[dbState],
      email: emailConfigured ? "configured" : "missing",
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME
        ? "configured"
        : "missing",
    },
  });
});

/* =======================
   🔗 Routes
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

/* =======================
   ❌ Error Handler
======================= */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(500).json({
    status: "ERROR",
    message: err.message,
  });
});

/* =======================
   🛢️ MongoDB Connection
======================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start server only after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      verifyEmailConfig();
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });
