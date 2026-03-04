import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({ message: "Protected Product API Working" });
});

router.post("/create", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Only Admin Can Create Product" });
});

export default router;