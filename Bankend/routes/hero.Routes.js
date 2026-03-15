import express from "express";
import { getHeroSlides, createHeroSlide, deleteHeroSlide, updateHeroSlide } from "../controllers/hero.Controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config for hero images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `hero-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.route("/")
  .get(getHeroSlides)
  .post(authMiddleware, adminMiddleware, upload.single("image"), createHeroSlide);

router.route("/:id")
  .put(authMiddleware, adminMiddleware, upload.single("image"), updateHeroSlide)
  .delete(authMiddleware, adminMiddleware, deleteHeroSlide);

export default router;
