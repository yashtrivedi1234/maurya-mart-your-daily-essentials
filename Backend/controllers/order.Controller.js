import { Order } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { getIO } from "../utils/socketManager.js";
import { isValidName, isValidPhone, isValidPincode, normalizeWhitespace } from "../utils/validation.js";
import { sendEmailAsync } from "../utils/send.Email.js";

const sendOrderEmails = (order, userEmail) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";

  const orderItemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
    </tr>
  `
    )
    .join("");

  const emailTemplate = (title, recipientName) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #10b981; text-align: center;">MaurMart</h2>
      <h3 style="color: #111827;">${title}</h3>
      <p>Hello ${recipientName},</p>
      <p>Order ID: <strong>${order._id}</strong></p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Qty</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHtml}
        </tbody>
      </table>
      <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">
        Total Price: ₹${order.totalPrice}
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p><strong>Shipping Address:</strong></p>
        <p>${order.shippingAddress.name}<br>
        ${order.shippingAddress.phone}<br>
        ${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
        Thank you for shopping with MaurMart!
      </p>
    </div>
  `;

  // Send emails asynchronously (non-blocking)
  sendEmailAsync({
    to: userEmail,
    subject: `Order Receipt - MaurMart #${order._id.toString().substring(0, 8)}`,
    html: emailTemplate("Your Order Receipt", order.shippingAddress.name),
  });

  sendEmailAsync({
    to: adminEmail,
    subject: `New Order Received - MaurMart #${order._id.toString().substring(0, 8)}`,
    html: emailTemplate("New Order Details", "Admin"),
  });
};

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const normalizedShippingAddress = {
      name: normalizeWhitespace(shippingAddress.name),
      phone: shippingAddress.phone?.trim(),
      address: normalizeWhitespace(shippingAddress.address),
      city: normalizeWhitespace(shippingAddress.city),
      pincode: shippingAddress.pincode?.trim(),
    };

    if (!normalizedShippingAddress.name || !isValidName(normalizedShippingAddress.name)) {
      return res.status(400).json({ message: "Enter a valid full name" });
    }

    if (!normalizedShippingAddress.phone || !isValidPhone(normalizedShippingAddress.phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit mobile number starting with 6 to 9" });
    }

    if (!normalizedShippingAddress.address || normalizedShippingAddress.address.length < 10) {
      return res.status(400).json({ message: "Enter a valid full address" });
    }

    if (!normalizedShippingAddress.city || !isValidName(normalizedShippingAddress.city)) {
      return res.status(400).json({ message: "Enter a valid city name" });
    }

    if (!normalizedShippingAddress.pincode || !isValidPincode(normalizedShippingAddress.pincode)) {
      return res.status(400).json({ message: "Enter a valid 6-digit pincode" });
    }

    // Check stock availability before creating order
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress: normalizedShippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Paid",
      razorpay_payment_id: req.body.razorpay_payment_id,
    });

    const savedOrder = await order.save();

    // Reduce stock for each product in the order
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Populate products for email details
    const populatedOrder = await Order.findById(savedOrder._id).populate("items.product");
    const user = await User.findById(req.user.id);

    if (user && user.email) {
      sendOrderEmails(populatedOrder, user.email);
    }

    // Clear user cart after successful order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Emit real-time event to notify admins
    try {
      getIO().to("dashboard").emit("orderCreated", {
        orderId: savedOrder._id,
        customerId: req.user.id,
        totalPrice: savedOrder.totalPrice,
        itemsCount: items.length,
        timestamp: new Date(),
      });
      getIO().to("dashboard").emit("dashboardReload");
    } catch (error) {
      console.error("❌ Error emitting Socket.IO event:", error.message);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Get all orders for admin
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.status;
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      
      // Emit real-time event to notify admins about status change
      try {
        getIO().to("dashboard").emit("orderStatusUpdated", {
          orderId: updatedOrder._id,
          oldStatus: oldStatus,
          newStatus: updatedOrder.status,
          timestamp: new Date(),
        });
        getIO().to("dashboard").emit("dashboardReload");
      } catch (error) {
        console.error("❌ Error emitting Socket.IO event:", error.message);
      }
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
