import { Smartphone, UtensilsCrossed, Shirt, Sparkles, Home, Headphones } from "lucide-react";

const categories = [
  { name: "Electronics", icon: Smartphone, color: "145 63% 42%" },
  { name: "Kitchen", icon: UtensilsCrossed, color: "30 80% 55%" },
  { name: "Fashion", icon: Shirt, color: "280 60% 55%" },
  { name: "Beauty", icon: Sparkles, color: "340 70% 55%" },
  { name: "Home & Living", icon: Home, color: "200 70% 50%" },
  { name: "Audio", icon: Headphones, color: "10 70% 55%" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Browse our wide range of categories to find exactly what you need
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ name, icon: Icon, color }) => (
            <a
              key={name}
              href="#"
              className="group bg-card rounded-xl p-6 text-center card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `hsl(${color} / 0.12)` }}
              >
                <Icon className="h-7 w-7" style={{ color: `hsl(${color})` }} />
              </div>
              <span className="font-medium text-sm text-foreground">{name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
