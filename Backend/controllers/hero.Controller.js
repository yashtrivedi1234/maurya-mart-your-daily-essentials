import { HeroSlide } from "../models/hero.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// @desc    Get all hero slides
// @route   GET /api/heroes
// @access  Public
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({});
    // If empty, return a default slide so the frontend doesn't break
    if (slides.length === 0) {
        return res.json([{
            _id: "default-1",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
            badge: "🚀 Welcome to Maurya Mart",
            heading: "Your Daily Essentials,",
            highlight: "Delivered Fast",
            sub: "Shop the best quality products at unbeatable prices."
        }]);
    }
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a hero slide
// @route   POST /api/heroes
// @access  Private/Admin
export const createHeroSlide = async (req, res) => {
  try {
    const { badge, heading, highlight, sub } = req.body;
    
    let imageUrl = req.body.image;
    let publicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "hero");
      if (result) {
        imageUrl = result.url;
        publicId = result.public_id;
      }
    }

    const slide = new HeroSlide({
      image: imageUrl,
      image_public_id: publicId,
      badge,
      heading,
      highlight,
      sub,
    });

    const createdSlide = await slide.save();
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
            // Delete old one
            if (slide.image_public_id) {
                await deleteFromCloudinary(slide.image_public_id);
            }
            // Upload new one
            const result = await uploadToCloudinary(req.file.path, "hero");
            if (result) {
                slide.image = result.url;
                slide.image_public_id = result.public_id;
            }
        } else if (req.body.image) {
            slide.image = req.body.image;
        }

        slide.badge = req.body.badge || slide.badge;
        slide.heading = req.body.heading || slide.heading;
        slide.highlight = req.body.highlight || slide.highlight;
        slide.sub = req.body.sub || slide.sub;

        const updatedSlide = await slide.save();
        res.json(updatedSlide);
    } else {
        res.status(404).json({ message: "Slide not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
