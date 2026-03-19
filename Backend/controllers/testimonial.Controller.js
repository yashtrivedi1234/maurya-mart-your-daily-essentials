import { Testimonial } from "../models/testimonial.model.js";
import mongoose from "mongoose";
import { getIO } from "../utils/socketManager.js";

/* ════════════════════════════════════════════════════════════════════════════ */
/*                          ADMIN - CREATE TESTIMONIAL                          */
/* ════════════════════════════════════════════════════════════════════════════ */
export const createTestimonial = async (req, res) => {
  try {
    const {
      name,
      email,
      googleProfileUrl,
      profileImage,
      rating,
      title,
      review,
    } = req.body;

    // Validation
    if (!name || !googleProfileUrl || !profileImage || !rating || !title || !review) {
      return res.status(400).json({
        message: "All fields are required: name, googleProfileUrl, profileImage, rating, title, review",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const testimonial = new Testimonial({
      name,
      email,
      googleProfileUrl,
      profileImage,
      rating,
      title,
      review,
      status: "approved", // Admin can directly approve
    });

    const savedTestimonial = await testimonial.save();
    
    // 📡 Broadcast testimonial created event
    const io = getIO();
    io.emit("testimonialCreated", {
      testimonial: savedTestimonial,
      message: `New testimonial from ${savedTestimonial.name}`,
      timestamp: new Date(),
    });
    
    res.status(201).json(savedTestimonial);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create testimonial",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                       GET ALL APPROVED TESTIMONIALS                          */
/* ════════════════════════════════════════════════════════════════════════════ */
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" })
      .sort({ postedDate: -1 })
      .limit(10)
      .lean();

    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch testimonials",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                      GET TESTIMONIAL BY ID                                   */
/* ════════════════════════════════════════════════════════════════════════════ */
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch testimonial",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                   ADMIN - GET ALL TESTIMONIALS (PENDING)                      */
/* ════════════════════════════════════════════════════════════════════════════ */
export const getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "pending" })
      .sort({ createdAt: 1 });

    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending testimonials",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                    ADMIN - APPROVE/REJECT TESTIMONIAL                        */
/* ════════════════════════════════════════════════════════════════════════════ */
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update testimonial status",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                       UPDATE TESTIMONIAL                                     */
/* ════════════════════════════════════════════════════════════════════════════ */
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rating, title, review, profileImage, googleProfileUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (rating) updateData.rating = rating;
    if (title) updateData.title = title;
    if (review) updateData.review = review;
    if (profileImage) updateData.profileImage = profileImage;
    if (googleProfileUrl) updateData.googleProfileUrl = googleProfileUrl;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // 📡 Broadcast testimonial updated event
    const io = getIO();
    io.emit("testimonialUpdated", {
      testimonial,
      message: `Testimonial updated from ${testimonial.name}`,
      timestamp: new Date(),
    });

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update testimonial",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                       DELETE TESTIMONIAL                                     */
/* ════════════════════════════════════════════════════════════════════════════ */
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // 📡 Broadcast testimonial deleted event
    const io = getIO();
    io.emit("testimonialDeleted", {
      testimonialId: testimonial._id,
      message: `Testimonial deleted from ${testimonial.name}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete testimonial",
      error: error.message,
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                    MARK HELPFUL / NOT HELPFUL                                */
/* ════════════════════════════════════════════════════════════════════════════ */
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }

    if (typeof helpful !== "boolean") {
      return res.status(400).json({ message: "helpful must be a boolean" });
    }

    const updateField = helpful ? "helpful" : "notHelpful";
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update helpful count",
      error: error.message,
    });
  }
};
