import { useEffect } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import { productApi } from "@/store/api/productApi";
import { brandApi } from "@/store/api/brandApi";
import { heroApi } from "@/store/api/heroApi";
import { faqApi } from "@/store/api/faqApi";
import { testimonialApi } from "@/store/api/testimonialApi";
import { recommendationApi } from "@/store/api/recommendationApi";

/**
 * useRealTimeUpdates Hook
 * Listens to Socket.IO events from the admin panel and automatically refreshes data
 * Supports: Products, Brands, Hero Slides, FAQs, Testimonials, Recommendations
 */
export const useRealTimeUpdates = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io();

    console.log("🔌 Real-time listener initialized");

    /* ─── PRODUCT EVENTS ─── */
    socket.on("productCreated", (data) => {
      console.log("📦 Product created:", data);
      // Invalidate product caches to refetch
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productUpdated", (data) => {
      console.log("📦 Product updated:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productDeleted", (data) => {
      console.log("📦 Product deleted:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productStatusChanged", (data) => {
      console.log("📦 Product status changed:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    /* ─── BRAND EVENTS ─── */
    socket.on("brandCreated", (data) => {
      console.log("🏷️  Brand created:", data);
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    socket.on("brandDeleted", (data) => {
      console.log("🏷️  Brand deleted:", data);
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    /* ─── HERO SLIDE EVENTS ─── */
    socket.on("heroSlideCreated", (data) => {
      console.log("🎬 Hero slide created:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideUpdated", (data) => {
      console.log("🎬 Hero slide updated:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideDeleted", (data) => {
      console.log("🎬 Hero slide deleted:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    /* ─── FAQ EVENTS ─── */
    socket.on("faqCreated", (data) => {
      console.log("❓ FAQ created:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqUpdated", (data) => {
      console.log("❓ FAQ updated:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqDeleted", (data) => {
      console.log("❓ FAQ deleted:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    /* ─── TESTIMONIAL EVENTS ─── */
    socket.on("testimonialCreated", (data) => {
      console.log("⭐ Testimonial created:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialUpdated", (data) => {
      console.log("⭐ Testimonial updated:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialDeleted", (data) => {
      console.log("⭐ Testimonial deleted:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    return () => {
      socket.disconnect();
      console.log("❌ Real-time listener disconnected");
    };
  }, [dispatch]);
};
