import express from "express";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.Controller.js";
import { authMiddleware } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

export default router;
