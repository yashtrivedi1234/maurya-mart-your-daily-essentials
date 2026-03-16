import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    image_public_id: {
      type: String,
    },
    badge: {
      type: String,
      default: "✨ New Update",
    },
    heading: {
      type: String,
      required: true,
    },
    highlight: {
      type: String,
      required: true,
    },
    sub: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const HeroSlide = mongoose.model("HeroSlide", heroSlideSchema);
