import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/product.model.js";

dotenv.config();

const dummyProducts = [
  // Featured Products
  { name: "Wireless Earbuds Pro", description: "High quality wireless earbuds.", price: 1499, originalPrice: 2999, rating: 4.5, reviews: 234, category: "Electronics", image: "🎧", isFeatured: true, stock: 50 },
  { name: "Organic Green Tea (100g)", description: "Premium organic green tea leaves.", price: 299, originalPrice: 450, rating: 4.7, reviews: 189, category: "Kitchen", image: "🍵", isFeatured: true, stock: 100 },
  { name: "Smart Watch Series 5", description: "Advanced smartwatch with health tracking.", price: 3999, originalPrice: 7999, rating: 4.3, reviews: 156, category: "Electronics", image: "⌚", isFeatured: true, stock: 30 },
  { name: "Premium Face Wash", description: "Gentle and effective face wash.", price: 249, originalPrice: 399, rating: 4.6, reviews: 312, category: "Beauty", image: "✨", isFeatured: true, stock: 200 },
  { name: "Cotton T-Shirt Pack", description: "Comfortable cotton t-shirts.", price: 699, originalPrice: 1299, rating: 4.4, reviews: 98, category: "Fashion", image: "👕", isFeatured: true, stock: 150 },
  { name: "Bluetooth Speaker", description: "Portable bluetooth speaker with deep bass.", price: 1299, originalPrice: 2499, rating: 4.5, reviews: 201, category: "Audio", image: "🔊", isFeatured: true, stock: 80 },
  { name: "Stainless Steel Bottle", description: "Durable stainless steel water bottle.", price: 399, originalPrice: 699, rating: 4.8, reviews: 445, category: "Home", image: "🧴", isFeatured: true, stock: 120 },
  { name: "LED Desk Lamp", description: "Adjustable LED desk lamp.", price: 899, originalPrice: 1599, rating: 4.2, reviews: 87, category: "Home", image: "💡", isFeatured: true, stock: 60 },

  // New Arrivals
  { name: "Air Purifier Mini", description: "Compact air purifier for small rooms.", price: 2499, originalPrice: 4999, rating: 4.6, category: "Home Appliances", image: "🌬️", isNewArrival: true, stock: 45 },
  { name: "Bamboo Water Bottle", description: "Eco-friendly bamboo water bottle.", price: 599, originalPrice: 999, rating: 4.8, category: "Home", image: "🎋", isNewArrival: true, stock: 85 },
  { name: "Wireless Charger Pad", description: "Fast wireless charging pad.", price: 799, originalPrice: 1499, rating: 4.4, category: "Electronics", image: "🔋", isNewArrival: true, stock: 110 },
  { name: "Organic Face Serum", description: "Rejuvenating organic face serum.", price: 449, originalPrice: 899, rating: 4.7, category: "Beauty", image: "🧴", isNewArrival: true, stock: 130 },

  // Trending Deals
  { name: "Premium Headphones", description: "Noise cancelling premium headphones.", price: 999, originalPrice: 2499, category: "Audio", image: "🎧", isTrending: true, stock: 25 },
  { name: "Smart LED Bulb Pack", description: "Color changing smart LED bulbs.", price: 349, originalPrice: 899, category: "Home", image: "💡", isTrending: true, stock: 200 },
  { name: "Yoga Mat Premium", description: "Non-slip premium yoga mat.", price: 499, originalPrice: 1299, category: "Sports", image: "🧘", isTrending: true, stock: 65 },
  { name: "Organic Honey 500g", description: "Pure raw organic honey.", price: 199, originalPrice: 499, category: "Groceries", image: "🍯", isTrending: true, stock: 90 },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Clear existing products to avoid duplicates
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert new dummy products
    await Product.insertMany(dummyProducts);
    console.log("Successfully seeded dummy products! 🌱");

    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
