import { Product } from "../models/product.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured products", error: error.message });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch new arrivals", error: error.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trending products", error: error.message });
  }
};

// @desc    Update product status (flags)
// @route   PATCH /api/products/admin/:id/status
// @access  Private/Admin
export const updateProductStatus = async (req, res) => {
  try {
    const { isFeatured, isNewArrival, isTrending } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (isNewArrival !== undefined) product.isNewArrival = isNewArrival;
      if (isTrending !== undefined) product.isTrending = isTrending;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, category, rating, reviews, stock, isFeatured, isNewArrival, isTrending } = req.body;
    
    // Use the uploaded file path if available
    let imageUrl = req.body.image; // Fallback to provided URL if no file
    if (req.file) {
      imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    const product = new Product({
      name,
      price,
      originalPrice,
      description,
      image: imageUrl,
      category,
      rating: rating || 0,
      reviews: reviews || 0,
      stock: stock || 0,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isNewArrival: isNewArrival === "true" || isNewArrival === true,
      isTrending: isTrending === "true" || isTrending === true,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // If a new file is uploaded
      if (req.file) {
        // Delete old image if it was a local upload
        if (product.image && product.image.includes("http://localhost:5001/uploads/")) {
          const oldFileName = product.image.split("/").pop();
          const oldFilePath = path.join(__dirname, "..", "uploads", oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        product.image = `http://localhost:5001/uploads/${req.file.filename}`;
      } else if (req.body.image) {
        product.image = req.body.image;
      }

      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.originalPrice = req.body.originalPrice || product.originalPrice;
      product.description = req.body.description || product.description;
      product.category = req.body.category || product.category;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      
      // Handle boolean flags that might come as strings from FormData
      if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
      if (req.body.isNewArrival !== undefined) product.isNewArrival = req.body.isNewArrival === "true" || req.body.isNewArrival === true;
      if (req.body.isTrending !== undefined) product.isTrending = req.body.isTrending === "true" || req.body.isTrending === true;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const seedProducts = async (req, res) => {
  const mockProducts = [
    {
      name: "Organic Basmati Rice 5kg", description: "Premium long-grain basmati rice, perfect for daily meals.",
      price: 450, originalPrice: 550, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
      category: "Daily Essentials", rating: 4.5, reviews: 128, stock: 50, isFeatured: true
    },
    {
      name: "Wireless Bluetooth Earbuds", description: "High-quality sound with noise cancellation and 24hr battery.",
      price: 1999, originalPrice: 3499, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop",
      category: "Electronics", rating: 4.3, reviews: 256, stock: 30, isTrending: true
    },
    {
      name: "Stainless Steel Pressure Cooker 5L", description: "Durable and safe cooker for everyday cooking needs.",
      price: 1850, originalPrice: 2200, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
      category: "Kitchen Items", rating: 4.7, reviews: 89, stock: 20
    },
    {
      name: "LED Desk Lamp with USB Charging", description: "Adjustable brightness with modern minimalist design.",
      price: 899, originalPrice: 1299, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop",
      category: "Home Utility", rating: 4.2, reviews: 67, stock: 15
    },
    {
      name: "Leather Wallet for Men", description: "Genuine leather slim wallet with RFID protection.",
      price: 699, originalPrice: 999, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
      category: "Accessories", rating: 4.4, reviews: 203, stock: 100
    }
  ];

  try {
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(mockProducts);
    res.status(201).json(createdProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to seed products", error: error.message });
  }
};
