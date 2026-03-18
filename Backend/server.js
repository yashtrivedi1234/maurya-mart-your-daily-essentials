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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
   📦 Routes
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
  "https://maurmart.com",
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
    credentials: true,
  })
);

/* =======================
   🧩 Middlewares
======================= */

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   ❤️ USER FRIENDLY HEALTH
======================= */

app.get("/health", (req, res) => {
  const uptimeSeconds = process.uptime();

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs} hr ${mins} min ${secs} sec`;
  };

  const formatBytes = (bytes) =>
    (bytes / 1024 / 1024).toFixed(2) + " MB";

  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "❌ Disconnected",
    1: "✅ Connected",
    2: "⏳ Connecting",
    3: "⚠️ Disconnecting",
  };

  const cpuLoad = os.loadavg()[0];
  let cpuStatus = "✅ Normal";
  if (cpuLoad > 5) cpuStatus = "⚠️ High Load";
  if (cpuLoad > 10) cpuStatus = "❌ Very High Load";

  res.status(200).json({
    status: "✅ Server is running smoothly",

    "📅 Current Time": new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),

    "⏱ Server Uptime": formatUptime(uptimeSeconds),

    "🚀 Server Started At": new Date(serverStartTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),

    "💻 System Info": {
      OS: process.platform,
      "Node Version": process.version,
      Environment: process.env.NODE_ENV || "development",
      "CPU Cores": os.cpus().length,
      "CPU Load": `${cpuLoad.toFixed(2)} (${cpuStatus})`,
    },

    "🧠 Memory Usage": {
      "App Memory Used": formatBytes(process.memoryUsage().heapUsed),
      "Total System Memory": formatBytes(os.totalmem()),
      "Free Memory": formatBytes(os.freemem()),
    },

    "🔗 Services Status": {
      Database: dbStatusMap[dbState],
      Email:
        process.env.EMAIL_USER && process.env.EMAIL_PASS
          ? "✅ Working"
          : "❌ Not Configured",
      Cloudinary: process.env.CLOUDINARY_CLOUD_NAME
        ? "✅ Connected"
        : "❌ Not Configured",
    },
  });
});

/* =======================
   🧠 DEVELOPER HEALTH
======================= */

app.get("/health/dev", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
    memory: process.memoryUsage(),
    cpu: os.loadavg(),
    platform: process.platform,
    nodeVersion: process.version,
    dbState: mongoose.connection.readyState,
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
   🛢️ MongoDB + Server
======================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      verifyEmailConfig();
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });
