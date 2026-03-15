import express from "express";
import { authMiddleware } from "../middleware/auth.Middleware.js";
import { getCart, addItemToCart, updateCartItem, removeItemFromCart, clearCart } from "../controllers/cart.Controller.js";

const router = express.Router();

// All cart routes are protected
router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addItemToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeItemFromCart);
router.post("/clear", clearCart);

export default router;