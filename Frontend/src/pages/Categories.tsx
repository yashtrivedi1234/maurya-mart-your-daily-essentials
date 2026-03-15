import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Laptop, 
  Utensils, 
  Sparkles, 
  Shirt, 
  Headphones, 
  Home as HomeIcon, 
  Smartphone, 
  Gift,
  ArrowRight
} from "lucide-react";

const categories = [
  { name: "Electronics", icon: Laptop, count: 120, color: "bg-blue-500/10 text-blue-600", image: "💻" },
  { name: "Kitchen", icon: Utensils, count: 85, color: "bg-orange-500/10 text-orange-600", image: "🍳" },
  { name: "Beauty", icon: Sparkles, count: 64, color: "bg-pink-500/10 text-pink-600", image: "✨" },
  { name: "Fashion", icon: Shirt, count: 142, color: "bg-purple-500/10 text-purple-600", image: "👕" },
  { name: "Audio", icon: Headphones, count: 43, color: "bg-indigo-500/10 text-indigo-600", image: "🎧" },
  { name: "Home Decor", icon: HomeIcon, count: 91, color: "bg-emerald-500/10 text-emerald-600", image: "🏡" },
  { name: "Mobile", icon: Smartphone, count: 56, color: "bg-cyan-500/10 text-cyan-600", image: "📱" },
  { name: "Gifts", icon: Gift, count: 38, color: "bg-rose-500/10 text-rose-600", image: "🎁" },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Browse by <span className="text-primary">Category</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore our wide range of products across various categories. Find exactly what you need with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="group cursor-pointer bg-card rounded-3xl p-8 card-shadow hover:card-shadow-hover hover:-translate-y-2 transition-all duration-300 border border-border/40 text-center"
            onClick={() => navigate(`/shop?category=${cat.name}`)}
          >
            <div className={`w-20 h-20 mx-auto rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <cat.icon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
            <p className="text-muted-foreground mb-6">{cat.count} Products</p>
            <Button variant="ghost" className="rounded-full group-hover:text-primary group-hover:bg-primary/5 transition-colors gap-2">
              Browse Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-primary/5 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground">Try using our search feature or contact our support team.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-full px-8 h-12" onClick={() => navigate("/shop")}>
            View All Products
          </Button>
          <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => navigate("/contact")}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
