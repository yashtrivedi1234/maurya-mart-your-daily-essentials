import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import { ScrollToTop } from "./ScrollToTop";
import LiveUpdateIndicator from "./LiveUpdateIndicator";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

const Layout = () => {
  // Initialize real-time socket updates
  useRealTimeUpdates();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <ScrollToTop />
      <LiveUpdateIndicator />
    </div>
  );
};

export default Layout;
