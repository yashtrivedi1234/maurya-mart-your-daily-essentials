export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  createdAt: string;
  sales: number;
}

export const categories = [
  "Daily Essentials",
  "Electronics",
  "Kitchen Items",
  "Accessories",
  "Home Utility",
];

export const priceRanges = [
  { label: "₹0 – ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000+", min: 5000, max: Infinity },
];

export const sortOptions = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "best-selling" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export const mockProducts: Product[] = [
  {
    id: "1", name: "Organic Basmati Rice 5kg", description: "Premium long-grain basmati rice, perfect for daily meals.",
    price: 450, originalPrice: 550, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    category: "Daily Essentials", rating: 4.5, reviews: 128, inStock: true, createdAt: "2025-03-01", sales: 342,
  },
  {
    id: "2", name: "Wireless Bluetooth Earbuds", description: "High-quality sound with noise cancellation and 24hr battery.",
    price: 1999, originalPrice: 3499, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop",
    category: "Electronics", rating: 4.3, reviews: 256, inStock: true, createdAt: "2025-02-15", sales: 189,
  },
  {
    id: "3", name: "Stainless Steel Pressure Cooker 5L", description: "Durable and safe cooker for everyday cooking needs.",
    price: 1850, originalPrice: 2200, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    category: "Kitchen Items", rating: 4.7, reviews: 89, inStock: true, createdAt: "2025-01-20", sales: 412,
  },
  {
    id: "4", name: "LED Desk Lamp with USB Charging", description: "Adjustable brightness with modern minimalist design.",
    price: 899, originalPrice: 1299, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop",
    category: "Home Utility", rating: 4.2, reviews: 67, inStock: true, createdAt: "2025-02-28", sales: 156,
  },
  {
    id: "5", name: "Leather Wallet for Men", description: "Genuine leather slim wallet with RFID protection.",
    price: 699, originalPrice: 999, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
    category: "Accessories", rating: 4.4, reviews: 203, inStock: true, createdAt: "2025-03-02", sales: 278,
  },
  {
    id: "6", name: "Cold Pressed Coconut Oil 1L", description: "100% pure and organic coconut oil for cooking and hair.",
    price: 320, originalPrice: 400, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
    category: "Daily Essentials", rating: 4.6, reviews: 312, inStock: true, createdAt: "2025-01-10", sales: 567,
  },
  {
    id: "7", name: "Smart Watch Fitness Tracker", description: "Track your health with heart rate, steps, and sleep monitoring.",
    price: 3499, originalPrice: 5999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Electronics", rating: 4.1, reviews: 178, inStock: true, createdAt: "2025-02-20", sales: 234,
  },
  {
    id: "8", name: "Non-Stick Frying Pan Set", description: "3-piece set with heat-resistant handles and easy cleanup.",
    price: 1299, originalPrice: 1799, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    category: "Kitchen Items", rating: 4.5, reviews: 145, inStock: false, createdAt: "2025-01-05", sales: 389,
  },
  {
    id: "9", name: "Cotton Bed Sheet Set (King)", description: "Soft breathable 300 thread count cotton sheets.",
    price: 1599, originalPrice: 2199, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop",
    category: "Home Utility", rating: 4.8, reviews: 92, inStock: true, createdAt: "2025-03-03", sales: 201,
  },
  {
    id: "10", name: "Sunglasses UV Protection", description: "Stylish polarized sunglasses with full UV protection.",
    price: 549, originalPrice: 899, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    category: "Accessories", rating: 4.0, reviews: 87, inStock: true, createdAt: "2025-02-10", sales: 143,
  },
  {
    id: "11", name: "Whole Wheat Flour 10kg", description: "Stone-ground atta for soft and healthy rotis.",
    price: 380, image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop",
    category: "Daily Essentials", rating: 4.3, reviews: 198, inStock: true, createdAt: "2025-01-25", sales: 623,
  },
  {
    id: "12", name: "Portable Bluetooth Speaker", description: "Waterproof speaker with deep bass and 12hr playtime.",
    price: 2499, originalPrice: 3999, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Electronics", rating: 4.6, reviews: 321, inStock: true, createdAt: "2025-02-25", sales: 445,
  },
];
