import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z ]+$/, "Name should contain only letters and spaces"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
    profilePic: { type: String, default: "" },
    profilePic_public_id: { type: String, default: "" },
    phone: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => {
          const normalizedValue = typeof value === "string" ? value.trim() : value;
          return !normalizedValue || /^[6-9]\d{9}$/.test(normalizedValue);
        },
        message: "Phone number must be 10 digits and start with 6 to 9",
      },
    },
    address: { type: String, default: "" },
    city: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => !value || /^[A-Za-z ]+$/.test(value),
        message: "City should contain only letters and spaces",
      },
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => {
          const normalizedValue = typeof value === "string" ? value.trim() : value;
          return !normalizedValue || /^\d{6}$/.test(normalizedValue);
        },
        message: "Pincode must be 6 digits",
      },
    },
    googleId: { type: String, default: null },
    hasPasswordSet: { type: Boolean, default: false }, // Track if user has set a real password
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
