import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { isValidEmail, isValidName, isValidOtp, isValidPassword, isValidPhone, isValidPincode, normalizeEmail, normalizeWhitespace } from "../utils/validation.js";
import { sendEmailAsync } from "../utils/send.Email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safely extract a user id from the JWT payload, regardless of key naming
const getUserIdFromReq = (req) => {
  if (!req || !req.user) return null;
  return req.user.id || req.user._id || req.user.userId || null;
};

export const registerUser = async (req, res) => {
  const name = normalizeWhitespace(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = req.body.password?.trim();
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ message: "Name should contain only letters and spaces" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      hasPasswordSet: true, // User registered with a password
    });

    res.status(201).json({ message: "User registered successfully. Please login to verify your account." });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = req.body.otp?.trim();
  try {
    if (!isValidEmail(email) || !isValidOtp(otp)) {
      return res.status(400).json({ message: "Enter a valid email and 4-digit OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ message: "Account verified successfully", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password?.trim();
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Strict Admin Check
    if (email === process.env.ADMIN_EMAIL) {
      if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        // Proactively update user role in DB if it's not admin
        if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
        }

        return res.json({ message: "Admin Login Successful", token, needsVerification: false });
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // Prevent any other users with "admin" role from logging in via regular flow if they don't match ADMIN_EMAIL
    if (user.role === "admin" && email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Access denied. Use official admin credentials." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email asynchronously (non-blocking)
    sendEmailAsync({
      to: email,
      subject: "Login Verification Code - MaurMart",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">MaurMart Login</h2>
          <p>Please use the following code to complete your login:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">${otp}</div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    // Send response immediately without waiting for email
    res.json({ message: "Verification code sent to email", needsVerification: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  try {
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email asynchronously (non-blocking)
    sendEmailAsync({
      to: email,
      subject: "Your New Verification Code - MaurMart",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">MaurMart</h2>
          <p>Your new verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">${otp}</div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    // Send response immediately without waiting for email
    res.json({ message: "New verification code sent to email" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Failed to resend code", error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    
    if (!userId) {
      console.error("❌ Invalid token payload - missing id/_id/userId. Received:", req.user);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const name = req.body.name !== undefined ? normalizeWhitespace(req.body.name) : undefined;
  const phone = req.body.phone !== undefined ? req.body.phone.trim() : undefined;
  const address = req.body.address !== undefined ? normalizeWhitespace(req.body.address) : undefined;
  const city = req.body.city !== undefined ? normalizeWhitespace(req.body.city) : undefined;
  const pincode = req.body.pincode !== undefined ? req.body.pincode.trim() : undefined;
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) {
      if (!name) return res.status(400).json({ message: "Name is required" });
      if (!isValidName(name)) {
        return res.status(400).json({ message: "Name should contain only letters and spaces" });
      }
      user.name = name;
    }

    if (phone !== undefined) {
      if (phone && !isValidPhone(phone)) {
        return res.status(400).json({ message: "Enter a valid 10-digit mobile number starting with 6 to 9" });
      }
      user.phone = phone;
    }

    if (address !== undefined) user.address = address;

    if (city !== undefined) {
      if (city && !isValidName(city)) {
        return res.status(400).json({ message: "City should contain only letters and spaces" });
      }
      user.city = city;
    }

    if (pincode !== undefined) {
      if (pincode && !isValidPincode(pincode)) {
        return res.status(400).json({ message: "Enter a valid 6-digit pincode" });
      }
      user.pincode = pincode;
    }

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old profile pic from Cloudinary if it exists
    if (user.profilePic_public_id) {
      await deleteFromCloudinary(user.profilePic_public_id);
    }

    // Use file buffer directly from memory storage (no disk operations needed)
    const result = await uploadToCloudinary(req.file.buffer, "profiles");
    
    if (result) {
      user.profilePic = result.url;
      user.profilePic_public_id = result.public_id;
      await user.save();
    } else {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
    }

    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Upload Profile Pic Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a 4-digit reset code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset code to user
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send email asynchronously (non-blocking)
    sendEmailAsync({
      to: email,
      subject: "Password Reset Code - MaurMart",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">${resetCode}</div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    // Send response immediately without waiting for email
    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = req.body.code?.trim();
  const newPassword = req.body.newPassword?.trim();
  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!isValidOtp(code)) {
      return res.status(400).json({ message: "Enter a valid 4-digit code" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if reset code is valid
    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Check if reset code has expired
    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful. Please log in with your new password." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const name = req.body.name ? normalizeWhitespace(req.body.name) : "";
  const { picture } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required from Google" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Google data
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: bcrypt.hashSync(Math.random().toString(36).slice(-10), 10), // Random password
        isVerified: true, // Google verified email
        profilePic: picture || null,
        googleId: email, // Store Google email as google ID
      });
    } else {
      // Update user profile if they have new data
      if (!user.profilePic && picture) {
        user.profilePic = picture;
      }
      if (!user.isVerified) {
        user.isVerified = true;
      }
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: user ? "Welcome back!" : "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const oldPassword = req.body.oldPassword?.trim();
  const newPassword = req.body.newPassword?.trim();
  const confirmPassword = req.body.confirmPassword?.trim();
  
  try {
    // Validate new password and confirmation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Get user ID from token
    const userId = getUserIdFromReq(req);
    if (!userId || userId === "unknown") {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has already set a real password (not Google user or already changed password), verify old password
    if (user.hasPasswordSet) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      if (newPassword === oldPassword) {
        return res.status(400).json({ message: "New password must be different from current password" });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and mark that password has been set
    user.password = hashedPassword;
    user.hasPasswordSet = true;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: err.message });
  }
};
