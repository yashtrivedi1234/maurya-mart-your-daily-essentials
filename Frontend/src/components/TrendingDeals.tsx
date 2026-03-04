import { Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const deals = [
  { id: 1, name: "Premium Headphones", price: 999, mrp: 2499, image: "🎧", endsIn: "2h 15m", sold: 78 },
  { id: 2, name: "Smart LED Bulb Pack", price: 349, mrp: 899, image: "💡", endsIn: "5h 30m", sold: 65 },
  { id: 3, name: "Yoga Mat Premium", price: 499, mrp: 1299, image: "🧘", endsIn: "1h 45m", sold: 92 },
  { id: 4, name: "Organic Honey 500g", price: 199, mrp: 499, image: "🍯", endsIn: "3h 10m", sold: 54 },
];

const TrendingDeals = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-6 w-6 text-destructive" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Trending Deals
          </h2>
        </div>
        <p className="text-muted-foreground mb-10">Limited-time offers — grab them before they're gone!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deals.map((deal) => {
            const discount = Math.round(((deal.mrp - deal.price) / deal.mrp) * 100);
            return (
              <div
                key={deal.id}
                className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 border border-border"
              >
                <div className="bg-accent/40 h-40 flex items-center justify-center relative">
                  <span className="text-5xl">{deal.image}</span>
                  <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                    {discount}% OFF
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{deal.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-lg text-foreground">₹{deal.price}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{deal.mrp}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Ends in {deal.endsIn}</span>
                  </div>
                  {/* Progress bar for sold */}
                  <div className="w-full h-2 rounded-full bg-accent mb-1">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${deal.sold}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{deal.sold}% sold</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">
            View All Deals →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingDeals;
