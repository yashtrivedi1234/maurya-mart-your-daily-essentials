import { Link } from "react-router-dom";
import { Users, Target, Eye, Award, Truck, ShieldCheck, Heart, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  { icon: ShieldCheck, title: "Trust & Transparency", desc: "We believe in honest pricing, genuine products, and clear communication with every customer." },
  { icon: Heart, title: "Customer First", desc: "Every decision we make starts with one question — how does this benefit our customers?" },
  { icon: Truck, title: "Reliable Delivery", desc: "We partner with trusted logistics to ensure your orders arrive on time, every time." },
  { icon: Award, title: "Quality Assurance", desc: "Every product goes through strict quality checks before it reaches your doorstep." },
];

const team = [
  { name: "Vikas Maurya", role: "Co-Founder & Tech Lead", desc: "Driving the digital vision behind MaurMart with cutting-edge technology." },
  { name: "Anshu Maurya", role: "Co-Founder & Creative Head", desc: "Crafting the brand experience and ensuring every detail delights our customers." },
];

const milestones = [
  { year: "2024", title: "The Idea", desc: "MaurMart was born from a simple idea — make quality products accessible to everyone in India." },
  { year: "2024", title: "First 1,000 Orders", desc: "Within months of launch, we crossed our first major milestone with overwhelming customer love." },
  { year: "2025", title: "10K+ Products", desc: "Expanded our catalog to over 10,000 products across daily essentials, electronics, and more." },
  { year: "2025", title: "Pan-India Delivery", desc: "Launched nationwide shipping, reaching customers in every corner of the country." },
];

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(160_50%_40%/0.3),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
        
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            About MaurMart
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
            We're on a mission to make everyday shopping simple, affordable, and delightful for millions of Indians.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MaurMart started with a vision to bridge the gap between quality and affordability. We noticed that
              people in India often had to choose between paying premium prices at branded stores or settling for
              questionable quality at local shops.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We set out to change that. By building direct relationships with brands and manufacturers, we cut out
              the middlemen and pass the savings directly to you — our customers. From daily essentials like groceries
              and personal care to electronics and home utilities, we curate every product with care.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, MaurMart serves thousands of happy customers across India, and we're just getting started.
              Our promise remains the same: genuine products, best prices, and a shopping experience you'll love.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border card-shadow">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To democratize access to quality products by offering the best prices, fastest delivery, and most
                trustworthy shopping experience — empowering every Indian household to shop smarter.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border card-shadow">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most loved and trusted online marketplace — where quality meets affordability,
                and every customer feels valued, heard, and delighted with every order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Our Core Values</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">The principles that guide everything we do</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey / Timeline */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Our Journey</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Key milestones that shaped MaurMart</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{m.year}</span>
                  <h3 className="font-semibold text-foreground mt-1 mb-1">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Meet the Founders</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">The people behind the vision</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-card rounded-2xl p-8 border border-border card-shadow text-center"
              >
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Get in Touch</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">We'd love to hear from you</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Mail, label: "Email Us", value: "info@maurmart.com" },
              { icon: Phone, label: "Call Us", value: "+91 98765 43210" },
              { icon: MapPin, label: "Location", value: "India" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-xl p-6 border border-border card-shadow text-center">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{label}</h4>
                <p className="text-sm text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Join thousands of happy customers and discover quality products at unbeatable prices.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="hero" className="rounded-full px-8" asChild>
              <Link to="/shop">Explore Shop</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
