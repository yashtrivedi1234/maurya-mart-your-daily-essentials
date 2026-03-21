import React from "react";
import { Flame } from "lucide-react";
import { ProductRecommendation } from "@/store/api/recommendationApi";
import { useNavigate } from "react-router-dom";

interface TrendingProductsSectionProps {
  products: ProductRecommendation[];
  isLoading?: boolean;
}

const TrendingProductsSection: React.FC<TrendingProductsSectionProps> = ({
  products,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Flame className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl md:text-4xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Flame className="w-8 h-8 text-orange-600" />
          <h2 className="text-3xl md:text-4xl font-bold">Trending Now</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
              onClick={() => navigate(`/shop/${product._id}`)}
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Trending
                </div>
              </div>

              <div className="p-4">
                <p className="text-gray-600 text-xs mb-1">{product.category}</p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-orange-600">
                    ₹{product.price}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(Math.floor(product.rating))].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {product.rating % 1 !== 0 && <span>☆</span>}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>

                <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm">
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductsSection;
