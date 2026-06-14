"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  return_rate: number;
  common_return_reasons: string[];
  refurb_available: boolean;
  refurb_price: number | null;
  description: string | null;
}

const MOCK_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const CATEGORY_FILTERS = ["All", "electronics", "clothing", "home", "books", "sports"];

const fallbackProducts: Product[] = [
  { id: "1", name: "Sony WH-1000XM5 Headphones", category: "electronics", price: 29990, image_url: null, return_rate: 18, common_return_reasons: ["Sound quality not as expected", "Uncomfortable fit", "Connectivity issues"], refurb_available: true, refurb_price: 21990, description: "Premium noise cancelling headphones" },
  { id: "2", name: "Nike Air Max Running Shoes", category: "clothing", price: 8995, image_url: null, return_rate: 34, common_return_reasons: ["Size runs small", "Different color than shown", "Sole defect"], refurb_available: true, refurb_price: 5995, description: "Lightweight running shoes" },
  { id: "3", name: "Apple iPad 10th Gen", category: "electronics", price: 44900, image_url: null, return_rate: 12, common_return_reasons: ["Dead pixels", "Performance issues", "Not compatible"], refurb_available: true, refurb_price: 32900, description: "Powerful tablet for work and play" },
  { id: "4", name: "Prestige Pressure Cooker 5L", category: "home", price: 2499, image_url: null, return_rate: 8, common_return_reasons: ["Whistle defective", "Lid doesn't fit", "Wrong size delivered"], refurb_available: false, refurb_price: null, description: "Durable stainless steel cooker" },
  { id: "5", name: "Atomic Habits", category: "books", price: 399, image_url: null, return_rate: 5, common_return_reasons: ["Damaged pages", "Wrong edition"], refurb_available: false, refurb_price: null, description: "Bestselling self-improvement book" },
  { id: "6", name: "Nivia Football Size 5", category: "sports", price: 1299, image_url: null, return_rate: 15, common_return_reasons: ["Air doesn't hold", "Size smaller than expected"], refurb_available: true, refurb_price: 799, description: "Professional match football" },
];

// Placeholder images for products without image_url
const PLACEHOLDER_IMAGES: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  clothing:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  home: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  books:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  sports:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
};

function getRiskLevel(returnRate: number): { label: string; color: string } {
  if (returnRate <= 10) return { label: "Low", color: "bg-primary" };
  if (returnRate <= 25) return { label: "Medium", color: "bg-tertiary" };
  return { label: "High", color: "bg-error" };
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function capitalizeCategory(cat: string): string {
  if (cat === "home") return "Home & Kitchen";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    // Store mock user ID in localStorage
    if (!localStorage.getItem("slc_user_id")) {
      localStorage.setItem("slc_user_id", MOCK_USER_ID);
    }

    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/products`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-background text-on-background overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          {/* Brand Logo */}
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            SecondLife
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-base">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1" href="/">
              Home
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/marketplace">
              Marketplace
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">
              Dashboard
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:scale-105 transition-transform duration-200 cursor-pointer">
              💚 450 pts
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEPEOl_Ah6HUkOF6VnE61KhyfxeeddhWY8mBPbw1ce3T-qLJwce4ghuUfsNPxneMedcWixPrGSA9JWuEJjsVI8CJLaN3QWjb0Q4iEFGXoFXFcESGz4EpgHwX0xTpOvL5SVRMesplkSe_uYXQi-FbdG-EKJu_4bDNBzaWHcO9mx4dsSjy2128rjy6j2bNxDhPQSpHXm5Cw5O-6t93yY7zpUvnkKqcaZugLEhrna5t2PtBO3LoaRQDqzX_Wnimzn5m1NpzvGM8VLVpI"
                alt="User avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient relative min-h-[500px] flex items-center overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center py-16">
            <div>
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                Every Return Gets a <br />
                <span className="text-primary-fixed">Second Life</span>
              </h1>
              <p className="text-white/80 text-lg mb-10 max-w-lg leading-7">
                Join Amazon&apos;s premium circular economy. Shop certified pre-owned
                treasures or turn your returns into rewards that protect the planet.
              </p>
              <div className="flex flex-wrap gap-6">
                <button
                  onClick={() => router.push('/product/' + (products[0]?.id || ''))}
                  className="bg-primary-container text-on-primary-container px-10 py-6 rounded-xl text-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center gap-2"
                >
                  Start a Return
                  <span className="text-xl">→</span>
                </button>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 rounded-xl text-2xl font-semibold transition-all backdrop-blur-md"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="relative grid grid-cols-1 gap-6">
              <div className="glass-card p-6 rounded-2xl flex items-center gap-6 transform hover:translate-x-4 transition-transform duration-500">
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-container text-xl">📦</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
                    Circular Impact
                  </p>
                  <h3 className="text-white text-3xl font-bold leading-10 tracking-tight">
                    1.2M Products Saved
                  </h3>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex items-center gap-6 transform translate-x-8 hover:translate-x-12 transition-transform duration-500">
                <div className="w-12 h-12 bg-secondary-container/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary-container text-xl">☁️</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
                    Carbon Savings
                  </p>
                  <h3 className="text-white text-3xl font-bold leading-10 tracking-tight">
                    840K kg CO₂ Prevented
                  </h3>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex items-center gap-6 transform translate-x-4 hover:translate-x-8 transition-transform duration-500">
                <div className="w-12 h-12 bg-tertiary-container/20 rounded-full flex items-center justify-center">
                  <span className="text-tertiary-container text-xl">💰</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
                    Community Economy
                  </p>
                  <h3 className="text-white text-3xl font-bold leading-10 tracking-tight">
                    ₹24Cr Saved Value
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Filters & Search */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold leading-10 tracking-tight mb-1">
                Explore Circular Marketplace
              </h2>
              <p className="text-on-surface-variant text-base">
                Verified quality from people like you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-1 rounded-full text-sm font-semibold tracking-wide transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant/30"
                  }`}
                >
                  {cat === "All" ? "All" : capitalizeCategory(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10"
                >
                  <div className="aspect-square bg-surface-container animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-surface-container animate-pulse rounded" />
                    <div className="h-4 bg-surface-container animate-pulse rounded w-2/3" />
                    <div className="h-4 bg-surface-container animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold mb-2">Failed to load products</h3>
              <p className="text-on-surface-variant">{error}</p>
            </div>
          )}

          {/* Product Bento Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const risk = getRiskLevel(product.return_rate);
                const imageUrl =
                  (product.image_url && !product.image_url.includes("via.placeholder.com"))
                    ? product.image_url
                    : PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES.electronics;

                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="aspect-square bg-surface-container overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-2xl font-semibold leading-8 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-on-surface-variant text-sm font-semibold tracking-wide">
                            {capitalizeCategory(product.category)}
                            {product.refurb_available ? " • Refurb Available" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-semibold text-primary">
                            {formatPrice(product.refurb_price || product.price)}
                          </span>
                          {product.refurb_price && (
                            <span className="text-on-surface-variant line-through text-xs">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-3 border-t border-outline-variant/20">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-3 h-3 rounded-full ${risk.color} animate-pulse`}
                          />
                          <span className="text-xs font-medium text-on-surface">
                            Risk: {risk.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-secondary text-sm">✓</span>
                          <span className="text-xs font-medium text-on-surface">
                            Amazon Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white text-primary px-10 py-3 rounded-xl text-2xl font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No products found</h3>
              <p className="text-on-surface-variant">
                Try a different category filter.
              </p>
            </div>
          )}
        </section>

        {/* Condition Explanation Section */}
        <section className="bg-surface-container-low py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbzlqE3m2CfDq1KXzJmyHUAUBFk_Qm3BJBYUZ89LXQqH68wYeLa89YE13cTHRmxBFM0zNTgpU_yO5UAmz1qE0PKbQId_33QAIBJGut0G56mJbU1QbKnwihgUXkQvDXWeL-7P-D4oDWmd7lnK2vhdO2zqQsebCj7NZlIhVNOwja56R1xsACX1TlNEGdwelq0uVE2mIdrLw94M6fD98Elahy3NMJ52LmQB5jfjfK8RN0EvmXVAK7KvdreHoALpwqK6H2Z-by5KfmKVs"
                  alt="Quality assurance lab"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                  <p className="text-white text-2xl font-semibold">
                    Certified Quality Control
                  </p>
                  <p className="text-white/80 text-base">
                    Every item undergoes a rigorous 20-point inspection before listing.
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold leading-10 tracking-tight mb-6">
                  How We Grade Items
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold leading-8">Pristine</h4>
                      <p className="text-on-surface-variant text-base">
                        Indistinguishable from new. Often original factory seal or zero
                        sign of wear.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 shrink-0 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold leading-8">Refurbished</h4>
                      <p className="text-on-surface-variant text-base">
                        Professionally restored to full functionality by certified
                        technicians.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 shrink-0 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
                      <span className="text-xl">🌿</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold leading-8">Pre-Loved</h4>
                      <p className="text-on-surface-variant text-base">
                        Minor cosmetic wear but fully functional. The most sustainable
                        choice for your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 bg-surface-container-low border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-xs">
            <div className="text-xl font-bold text-primary mb-3">SecondLife</div>
            <p className="text-on-surface-variant text-sm font-semibold">
              © 2024 SecondLife by Amazon. Circular economy for a greener planet.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-on-background uppercase mb-1 tracking-wide">
                About
              </span>
              <a
                className="text-on-surface-variant text-sm font-semibold hover:underline transition-all"
                href="#"
              >
                Sustainability Report
              </a>
              <a
                className="text-on-surface-variant text-sm font-semibold hover:underline transition-all"
                href="#"
              >
                How it Works
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-on-background uppercase mb-1 tracking-wide">
                Support
              </span>
              <a
                className="text-on-surface-variant text-sm font-semibold hover:underline transition-all"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-on-surface-variant text-sm font-semibold hover:underline transition-all"
                href="#"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
