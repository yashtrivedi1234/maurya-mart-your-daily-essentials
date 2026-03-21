import { useGetBrandsQuery } from "@/store/api/brandApi";
import { Loader2 } from "lucide-react";

const BrandsSection = () => {
  const { data: brands = [], isLoading } = useGetBrandsQuery({});

  if (isLoading) {
    return (
      <section className="py-14 border-y border-border">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Brands You Trust
          </h2>
          <p className="mt-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Trusted brands we partner with
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-7">
          {brands.map((brand: any) => (
            <div
              key={brand._id}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={brand.image}
                alt="Brand"
                className="h-20 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
