import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    image_public_id: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    highlights: [String],
    specifications: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    questions: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    inTheBox: [String],
    bankOffers: [String],
    // Delivery & Seller Info
    soldLastMonth: {
      type: Number,
      default: 0,
    },
    deliveryInfo: {
      standard: { type: String, default: "Free Delivery" },
      standardDays: { type: String, default: "3-5 business days" },
      express: { type: String, default: "" },
      expressDays: { type: String, default: "" },
      expressPrice: { type: Number, default: 0 },
    },
    sellerInfo: {
      name: { type: String, default: "MaurMart" },
      rating: { type: Number, default: 0 },
      ratingPercentage: { type: String, default: "" },
    },
    returnPolicy: {
      days: { type: Number, default: 30 },
      description: { type: String, default: "Easy returns within specified days" },
    },
    warranty: {
      duration: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    paymentMethods: [String],
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
