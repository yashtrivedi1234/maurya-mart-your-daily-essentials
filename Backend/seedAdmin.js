import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    const adminEmail = process.env.ADMIN_EMAIL || "skumari57883@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "shalu#2004";

    // Check if user already exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
        console.log(`User ${adminEmail} already exists. Updating role to admin and resetting password...`);
        adminUser.role = "admin";
        adminUser.password = await bcrypt.hash(adminPassword, 10);
        await adminUser.save();
        console.log("Admin user updated successfully! 👑");
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            name: "Supriya Kumari",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });
        console.log("Admin user created successfully! 👑");
    }

    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
