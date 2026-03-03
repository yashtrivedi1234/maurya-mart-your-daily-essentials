const brands = [
  { name: "Samsung", emoji: "📱" },
  { name: "Sony", emoji: "🎮" },
  { name: "Philips", emoji: "💡" },
  { name: "Nestle", emoji: "🍫" },
  { name: "Nike", emoji: "👟" },
  { name: "Boat", emoji: "🎧" },
  { name: "Himalaya", emoji: "🌿" },
  { name: "Prestige", emoji: "🍳" },
];

const BrandsSection = () => {
  return (
    <section className="py-14 border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8 tracking-wide uppercase">
          Trusted Brands We Partner With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default"
            >
              <span className="text-3xl">{brand.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
