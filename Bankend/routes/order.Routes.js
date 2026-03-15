import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.Middleware.js";
import { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } from "../controllers/order.Controller.js";

const router = express.Router();

router.use(authMiddleware);

// User routes
router.post("/create", createOrder);
router.get("/user-orders", getUserOrders);
router.get("/:id", getOrderById);

// Admin routes
router.get("/", adminMiddleware, getAllOrders);
router.patch("/:id/status", adminMiddleware, updateOrderStatus);

export default router;
