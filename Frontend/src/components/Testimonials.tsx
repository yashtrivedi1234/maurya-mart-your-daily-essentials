import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Verified Buyer",
    avatar: "👩",
    rating: 5,
    text: "Amazing quality products at unbeatable prices! The delivery was super fast and packaging was excellent. Definitely my go-to store now.",
  },
  {
    name: "Rahul Patel",
    role: "Verified Buyer",
    avatar: "👨",
    rating: 5,
    text: "I ordered electronics and groceries together — everything came perfectly. The smart watch quality is way better than I expected for this price.",
  },
  {
    name: "Ananya Gupta",
    role: "Verified Buyer",
    avatar: "👩‍💼",
    rating: 4,
    text: "Love the variety of products available. Customer support was very helpful when I had a question about my order. Great experience overall!",
  },
  {
    name: "Vikram Singh",
    role: "Verified Buyer",
    avatar: "🧑",
    rating: 5,
    text: "The organic tea collection is outstanding. Fresh, well-packaged, and delivered right on time. Will keep ordering from Maurya Mart!",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Trusted by thousands of happy shoppers across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 relative border border-border"
            >
              <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${j < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
