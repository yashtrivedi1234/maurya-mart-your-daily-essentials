import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import { ScrollToTop } from "./ScrollToTop";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
