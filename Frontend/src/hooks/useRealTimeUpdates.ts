import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "@/context/SocketContext";
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
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log("⏳ Waiting for socket connection...");
      return;
    }

    console.log("🔄 Setting up real-time event listeners");

    /* ─── PRODUCT EVENTS ─── */
    socket.on("productCreated", (data) => {
      console.log("📦 Product created event received:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productUpdated", (data) => {
      console.log("📦 Product updated event received:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productDeleted", (data) => {
      console.log("📦 Product deleted event received:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productStatusChanged", (data) => {
      console.log("📦 Product status changed event received:", data);
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    /* ─── BRAND EVENTS ─── */
    socket.on("brandCreated", (data) => {
      console.log("🏷️  Brand created event received:", data);
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    socket.on("brandDeleted", (data) => {
      console.log("🏷️  Brand deleted event received:", data);
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    /* ─── HERO SLIDE EVENTS ─── */
    socket.on("heroSlideCreated", (data) => {
      console.log("🎬 Hero slide created event received:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideUpdated", (data) => {
      console.log("🎬 Hero slide updated event received:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideDeleted", (data) => {
      console.log("🎬 Hero slide deleted event received:", data);
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    /* ─── FAQ EVENTS ─── */
    socket.on("faqCreated", (data) => {
      console.log("❓ FAQ created event received:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqUpdated", (data) => {
      console.log("❓ FAQ updated event received:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqDeleted", (data) => {
      console.log("❓ FAQ deleted event received:", data);
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    /* ─── TESTIMONIAL EVENTS ─── */
    socket.on("testimonialCreated", (data) => {
      console.log("⭐ Testimonial created event received:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialUpdated", (data) => {
      console.log("⭐ Testimonial updated event received:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialDeleted", (data) => {
      console.log("⭐ Testimonial deleted event received:", data);
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    return () => {
      console.log("🧹 Cleaning up real-time event listeners");
      socket.offAny();
    };
  }, [socket, dispatch]);
};
