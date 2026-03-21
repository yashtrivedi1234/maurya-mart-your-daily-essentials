import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Genuine products only",
    desc: "We focus on trusted sourcing and quality-checked daily essentials.",
  },
  {
    icon: Truck,
    title: "Fast delivery flow",
    desc: "Optimized for quick local dispatch with reliable doorstep handling.",
  },
  {
    icon: RotateCcw,
    title: "Easy issue resolution",
    desc: "Damaged, missing, or wrong items can be reported without hassle.",
  },
  {
    icon: BadgeCheck,
    title: "Secure payments",
    desc: "Checkout is powered by trusted payment flows through Razorpay.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-display font-bold text-foreground">Why customers keep coming back</h2>
          <p className="mt-3 text-muted-foreground">
            Built for everyday shopping with fast fulfilment, trusted quality, and support that stays responsive.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
