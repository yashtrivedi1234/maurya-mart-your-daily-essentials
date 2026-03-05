import { Truck, ShieldCheck, IndianRupee, Headphones, PackageCheck, Clock } from "lucide-react";

const features = [
  { icon: Truck, title: "Free & Fast Delivery", desc: "Free shipping on orders above ₹499 with same-day delivery in select cities." },
  { icon: ShieldCheck, title: "100% Genuine Products", desc: "Every product is sourced directly from brands and verified for authenticity." },
  { icon: IndianRupee, title: "Best Prices Guaranteed", desc: "We match any competitor's price. Find it cheaper elsewhere? We'll beat it." },
  { icon: Headphones, title: "24/7 Customer Support", desc: "Our support team is available round the clock via chat, email, and phone." },
  { icon: PackageCheck, title: "Easy Returns & Refunds", desc: "Not satisfied? Return within 7 days for a full refund, no questions asked." },
  { icon: Clock, title: "Quick Checkout", desc: "Seamless checkout with Razorpay — UPI, cards, wallets, and net banking supported." },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Why Choose Maur Mart?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We go the extra mile to make your shopping experience seamless, secure, and satisfying
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
