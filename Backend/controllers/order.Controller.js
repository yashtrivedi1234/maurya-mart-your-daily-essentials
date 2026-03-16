import { Order } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderEmails = async (order, userEmail) => {
  const transporter = getTransporter();
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

  try {
    // Send to Customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Receipt - MaurMart #${order._id.toString().substring(0, 8)}`,
      html: emailTemplate("Your Order Receipt", order.shippingAddress.name),
    });

    // Send to Owner
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Order Received - MaurMart #${order._id.toString().substring(0, 8)}`,
      html: emailTemplate("New Order Details", "Admin"),
    });

    console.log("Order emails sent successfully");
  } catch (error) {
    console.error("Error sending order emails:", error);
  }
};

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Paid", // Simulating successful payment
    });

    const savedOrder = await order.save();

    // Populate products for email details
    const populatedOrder = await Order.findById(savedOrder._id).populate("items.product");
    const user = await User.findById(req.user.id);

    if (user && user.email) {
      sendOrderEmails(populatedOrder, user.email);
    }

    // Clear user cart after successful order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

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
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
