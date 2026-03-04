import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();
// Protected Cart Route
router.get("/", authMiddleware, async (req, res) => {
  res.json({
    message: "Protected Cart API Working",
    userId: req.user.id,
  });
});

export default router;