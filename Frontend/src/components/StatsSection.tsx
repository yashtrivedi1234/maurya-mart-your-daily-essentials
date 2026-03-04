const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "10K+", label: "Products Available" },
  { value: "500+", label: "Brands" },
  { value: "99%", label: "Satisfaction Rate" },
];

const StatsSection = () => {
  return (
    <section className="py-14 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-1">
                {s.value}
              </p>
              <p className="text-sm text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
