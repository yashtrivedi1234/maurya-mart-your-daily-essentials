import React, { useState, useEffect, useRef } from "react";
import { Check, Zap } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

/**
 * LiveUpdateIndicator Component
 * Shows a visual notification when real-time updates happen
 */
const LiveUpdateIndicator: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log("⏳ LiveUpdateIndicator: Waiting for socket connection...");
      return;
    }

    console.log("✅ LiveUpdateIndicator socket connected:", socket.id);

    const showUpdate = (message: string) => {
      console.log("🔔 Update notification:", message);
      setLastUpdate(message);
      setIsVisible(true);

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Auto-hide after 3 seconds
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    // Listen to various update events
    socket.on("productCreated", () => showUpdate("📦 Product added"));
    socket.on("productUpdated", () => showUpdate("📦 Product updated"));
    socket.on("productDeleted", () => showUpdate("📦 Product removed"));
    socket.on("productStatusChanged", () => showUpdate("📦 Product status changed"));

    socket.on("brandCreated", () => showUpdate("🏷️  New brand added"));
    socket.on("brandDeleted", () => showUpdate("🏷️  Brand removed"));

    socket.on("heroSlideCreated", () => showUpdate("🎬 Hero slide added"));
    socket.on("heroSlideUpdated", () => showUpdate("🎬 Hero slide updated"));
    socket.on("heroSlideDeleted", () => showUpdate("🎬 Hero slide removed"));

    socket.on("faqCreated", () => showUpdate("❓ FAQ added"));
    socket.on("faqUpdated", () => showUpdate("❓ FAQ updated"));
    socket.on("faqDeleted", () => showUpdate("❓ FAQ removed"));

    socket.on("testimonialCreated", () => showUpdate("⭐ New testimonial"));
    socket.on("testimonialUpdated", () => showUpdate("⭐ Testimonial updated"));
    socket.on("testimonialDeleted", () => showUpdate("⭐ Testimonial removed"));

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      console.log("🧹 LiveUpdateIndicator: Cleaning up event listeners");
      socket.offAny();
    };
  }, [socket]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-max">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-green-800">{lastUpdate}</span>
        <span className="text-xs text-green-600 ml-2">Live</span>
        <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
      </div>
    </div>
  );
};

export default LiveUpdateIndicator;
