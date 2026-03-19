import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

/* ----------------------------- HELPER FUNCTIONS ----------------------------- */

const toBoolean = (value) => value === "true" || value === true;

/* ----------------------------- GET ALL PRODUCTS ----------------------------- */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ----------------------------- GET PRODUCT BY ID ---------------------------- */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ---------------------------- FEATURED PRODUCTS ---------------------------- */
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8).lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ---------------------------- NEW ARRIVALS ---------------------------- */
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .limit(8)
      .lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ---------------------------- TRENDING PRODUCTS ---------------------------- */
export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true })
      .limit(8)
      .lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* --------------------------- UPDATE PRODUCT STATUS -------------------------- */
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, isNewArrival, isTrending } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (isFeatured !== undefined) product.isFeatured = toBoolean(isFeatured);
    if (isNewArrival !== undefined)
      product.isNewArrival = toBoolean(isNewArrival);
    if (isTrending !== undefined) product.isTrending = toBoolean(isTrending);

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({

      error: error.message,
    });
  }
};

/* ------------------------------ CREATE PRODUCT ------------------------------ */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      category,
      rating,
      numReviews,
      stock,
      isFeatured,
      isNewArrival,
      isTrending,
      highlights,
      specifications,
      questions,
      bankOffers,
      inTheBox,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Product image upload is required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "products");

    if (!result?.url || !result?.public_id) {
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary",
      });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
      description,
      category,
      image: result.url,
      image_public_id: result.public_id,
      rating: rating ? parseFloat(rating) : 0,
      numReviews: numReviews ? parseInt(numReviews) : 0,
      stock: stock ? parseInt(stock) : 0,
      isFeatured: toBoolean(isFeatured),
      isNewArrival: toBoolean(isNewArrival),
      isTrending: toBoolean(isTrending),
      highlights: highlights ? JSON.parse(highlights) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      questions: questions ? JSON.parse(questions) : [],
      bankOffers: bankOffers ? JSON.parse(bankOffers) : [],
      inTheBox: inTheBox ? JSON.parse(inTheBox) : [],
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ------------------------------ UPDATE PRODUCT ------------------------------ */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* -------- IMAGE UPDATE -------- */

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "products");

      if (!result?.url || !result?.public_id) {
        return res.status(500).json({
          message: "Failed to upload image",
        });
      }

      if (product.image_public_id) {
        await deleteFromCloudinary(product.image_public_id);
      }

      product.image = result.url;
      product.image_public_id = result.public_id;
    }

    /* -------- UPDATE FIELDS -------- */

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.category = req.body.category ?? product.category;

    if (req.body.price !== undefined)
      product.price = parseFloat(req.body.price);

    if (req.body.originalPrice !== undefined)
      product.originalPrice = parseFloat(req.body.originalPrice);

    if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock);

    if (req.body.rating !== undefined)
      product.rating = parseFloat(req.body.rating);

    if (req.body.numReviews !== undefined)
      product.numReviews = parseInt(req.body.numReviews);

    if (req.body.isFeatured !== undefined)
      product.isFeatured = toBoolean(req.body.isFeatured);

    if (req.body.isNewArrival !== undefined)
      product.isNewArrival = toBoolean(req.body.isNewArrival);

    if (req.body.isTrending !== undefined)
      product.isTrending = toBoolean(req.body.isTrending);

    if (req.body.highlights !== undefined)
      product.highlights = JSON.parse(req.body.highlights);

    if (req.body.specifications !== undefined)
      product.specifications = JSON.parse(req.body.specifications);

    if (req.body.questions !== undefined)
      product.questions = JSON.parse(req.body.questions);
    
    if (req.body.bankOffers !== undefined)
      product.bankOffers = JSON.parse(req.body.bankOffers);
    
    if (req.body.inTheBox !== undefined)
      product.inTheBox = JSON.parse(req.body.inTheBox);

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ------------------------------ DELETE PRODUCT ------------------------------ */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image_public_id) {
      await deleteFromCloudinary(product.image_public_id);
    }

    res.status(200).json({
      message: "Product removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ----------------------------- CHECK IF USER CAN REVIEW ----------------------------- */
export const canUserReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": productId,
      paymentStatus: "Paid",
    });

    res.status(200).json({ canReview: !!hasPurchased });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------- ADD PRODUCT REVIEW ----------------------------- */
export const addProductReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // 1. Check if user already reviewed
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // 2. Check if user purchased this product
    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": productId,
      paymentStatus: "Paid",
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Only verified buyers can review products" });
    }

    // 3. Get user details to get the name
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4. Add review
    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      user: userId,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};