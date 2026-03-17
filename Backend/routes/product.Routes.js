import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import multer from "multer";
import path from "path";
import {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getTrendingProducts,
  updateProductStatus,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.Controller.js";

const router = express.Router();

// Configure Multer for product images (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    
    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isExtAllowed = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    
    if (isMimeAllowed && isExtAllowed) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, PNG, and WebP images are allowed!"));
  }
});

// Public routes
router.get("/", getProducts);
router.get("/trending", getTrendingProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/:id", getProductById);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.patch("/admin/:id/status", authMiddleware, adminMiddleware, updateProductStatus);

export default router;