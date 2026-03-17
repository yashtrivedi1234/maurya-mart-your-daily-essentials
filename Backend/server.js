import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Email Configuration on Startup
const verifyEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ CRITICAL: Email credentials missing in .env file!");
    console.error("   Required: EMAIL_USER, EMAIL_PASS");
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Test the transporter
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email Configuration Error:", error.message);
      console.error("   Email:", process.env.EMAIL_USER);
      console.error("   Issue: Check if the app password is correct and Gmail account allows less secure apps");
    } else {
      console.log("✅ Email Configuration Valid - Ready to send emails");
      console.log("   Email:", process.env.EMAIL_USER);
    }
  });

  return true;
};

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "https://maurmart.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from tools like Postman and same-origin server-to-server calls.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err.message));

// Verify email configuration
verifyEmailConfig();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/heroes", heroRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/chat", chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err
  });
});

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5001} 🚀`);
});