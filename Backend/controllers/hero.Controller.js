import { HeroSlide } from "../models/hero.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../utils/socketManager.js";

// @desc    Get all hero slides
// @route   GET /api/heroes
// @access  Public
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({}).lean();

    res.status(200).json(slides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hero slides" });
  }
};

// @desc    Create a hero slide
// @route   POST /api/heroes
// @access  Private/Admin
export const createHeroSlide = async (req, res) => {
  try {
    const { badge, heading, highlight, sub } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Hero image upload is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "hero");
    if (!result?.url || !result?.public_id) {
      return res.status(500).json({ message: "Failed to upload hero image to Cloudinary" });
    }

    const slide = new HeroSlide({
      image: result.url,
      image_public_id: result.public_id,
      badge,
      heading,
      highlight,
      sub,
    });

    const createdSlide = await slide.save();
    
    // 📡 Broadcast hero slide created event
    const io = getIO();
    io.emit("heroSlideCreated", {
      slide: createdSlide,
      message: "New hero slide added",
      timestamp: new Date(),
    });
    
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a hero slide
// @route   DELETE /api/heroes/:id
// @access  Private/Admin
export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (slide) {
      if (slide.image_public_id) {
        await deleteFromCloudinary(slide.image_public_id);
      }
      await slide.deleteOne();
      
      // 📡 Broadcast hero slide deleted event
      const io = getIO();
      io.emit("heroSlideDeleted", {
        slideId: slide._id,
        message: "Hero slide removed",
        timestamp: new Date(),
      });
      
      res.json({ message: "Slide removed" });
    } else {
      res.status(404).json({ message: "Slide not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update a hero slide
// @route   PUT /api/heroes/:id
// @access  Private/Admin
export const updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (slide) {
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "hero");
      if (!result?.url || !result?.public_id) {
        return res.status(500).json({ message: "Failed to upload hero image to Cloudinary" });
            }

      if (slide.image_public_id) {
        await deleteFromCloudinary(slide.image_public_id);
      }

      slide.image = result.url;
      slide.image_public_id = result.public_id;
        }

        slide.badge = req.body.badge || slide.badge;
        slide.heading = req.body.heading || slide.heading;
        slide.highlight = req.body.highlight || slide.highlight;
        slide.sub = req.body.sub || slide.sub;

        const updatedSlide = await slide.save();
        
        // 📡 Broadcast hero slide updated event
        const io = getIO();
        io.emit("heroSlideUpdated", {
          slide: updatedSlide,
          message: "Hero slide updated",
          timestamp: new Date(),
        });
        
        res.json(updatedSlide);
    } else {
        res.status(404).json({ message: "Slide not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
