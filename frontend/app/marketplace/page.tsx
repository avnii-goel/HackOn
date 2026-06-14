"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { getListings, purchaseListing } from "@/lib/api";

interface Listing {
  id: string;
  seller_id: string;
  product_name: string;
  category: string;
  condition_score: number;
  verdict: string;
  ai_description: string | null;
  suggested_price: number;
  original_price: number;
  co2_saved: number;
  image_url: string | null;
  status: string;
  created_at: string;
}

const CATEGORY_FILTERS = ["All Items", "electronics", "clothing", "home", "books", "sports"];
const CONDITION_OPTIONS = [
  { label: "All Conditions", value: 0 },
  { label: "Excellent 80+", value: 80 },
  { label: "Good 60+", value: 60 },
  { label: "Fair 40+", value: 40 },
];
const SORT_OPTIONS = [
  { label: "Latest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Condition", value: "condition" },
];

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

function formatPrice(price: number): string {
  return `₹${Math.round(price).toLocaleString("en-IN")}`;
}

function capitalizeCategory(cat: string): string {
  if (cat === "home") return "Home & Kitchen";
  if (cat === "All Items") return "All Items";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function getConditionBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "Excellent", className: "bg-primary text-on-primary" };
  if (score >= 60) return { label: "Good", className: "bg-secondary text-on-secondary" };
  if (score >= 40) return { label: "Fair", className: "bg-tertiary-container text-on-tertiary-container" };
  return { label: "Poor", className: "bg-outline text-surface" };
}

export default function MarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [conditionMin, setConditionMin] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handlePurchase = async (listingId: string) => {
    const userId = localStorage.getItem("slc_user_id") || "";
    if (!userId) {
      toast.error("Please log in first");
      return;
    }

    // Optimistic update
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: "sold" } : l))
    );

    try {
      await purchaseListing(listingId, userId);
      toast.success("Purchased! +150 Green Credits added 💚", {
        style: { background: "#10b981", color: "#fff", fontWeight: 600 },
      });
    } catch {
      // Revert optimistic update
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "available" } : l))
      );
      toast.error("Purchase failed. Try again.");
    }
  };

  // Client-side filtering
  let filtered = [...listings];

  if (activeCategory !== "All Items") {
    filtered = filtered.filter((l) => l.category === activeCategory);
  }
  if (conditionMin > 0) {
    filtered = filtered.filter((l) => (l.condition_score || 0) >= conditionMin);
  }
  filtered = filtered.filter((l) => (l.suggested_price || 0) <= maxPrice);

  // Sorting
  switch (sortBy) {
    case "price_asc":
      filtered.sort((a, b) => (a.suggested_price || 0) - (b.suggested_price || 0));
      break;
    case "price_desc":
      filtered.sort((a, b) => (b.suggested_price || 0) - (a.suggested_price || 0));
      break;
    case "condition":
      filtered.sort((a, b) => (b.condition_score || 0) - (a.condition_score || 0));
      break;
    case "newest":
    default:
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div
            className="text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span>🌿</span> SecondLife
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-base text-on-surface-variant hover:text-primary transition-colors" href="/">
              Home
            </a>
            <a className="text-base text-primary font-bold border-b-2 border-primary pb-1" href="#">
              Marketplace
            </a>
            <a className="text-base text-on-surface-variant hover:text-primary transition-colors" href="#">
              Dashboard
            </a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-secondary-container px-4 py-1.5 rounded-full items-center gap-2 text-on-secondary-container text-sm font-semibold tracking-wide">
              💚 450 pts
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer hover:scale-105 transition-transform">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyyNbZrEzvZvFadv9DHmB0Ej0iCIlb5HH7byhJEuwyQViMRP9QHEI9Nx8q_nWE3VJJjVU2KCZEb3wfybxJxm0Cl16A1XtjM3-3fueGXTmYoRA3BEGqF5B97LGhF68MW3YZvoGmxYGsN4D4GAl7Z_w3t1RdlcOm87_rgeke-pycTFdD4FKIOqYCN3vnO8Q80AlJY8mfjZiYDuIqRJEqT663LtpjQsWKqH1mg_IFiDsnZSxxKRrjYM7DpO_KQNx1emRVJWrw1n8uIY0"
                alt="User avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        {/* Marketplace Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-primary mb-2 leading-tight tracking-tight">
            Second Life Marketplace
          </h1>
          <p className="text-on-surface-variant text-lg leading-7">
            Premium pre-owned items curated for a greener planet.
          </p>
        </div>

        {/* Filter Bar */}
        <section className="mb-10 space-y-6">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {capitalizeCategory(cat)}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 glass-card rounded-xl">
            {/* Condition */}
            <div className="relative">
              <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">
                Condition
              </label>
              <select
                value={conditionMin}
                onChange={(e) => setConditionMin(Number(e.target.value))}
                className="w-full bg-surface border border-outline-variant/30 rounded-lg py-2 pl-3 pr-10 focus:ring-2 focus:ring-primary-container appearance-none outline-none"
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 bottom-2.5 pointer-events-none text-on-surface-variant text-sm">
                ▼
              </span>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">
                Max Price: {formatPrice(maxPrice)}
              </label>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary mt-2"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">
                Sort Options
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-lg py-2 pl-3 pr-10 focus:ring-2 focus:ring-primary-container appearance-none outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 bottom-2.5 pointer-events-none text-on-surface-variant text-sm">
                ↕
              </span>
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <div className="w-full py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold text-center tracking-wide">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <div className="aspect-square bg-surface-container animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-surface-container animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-surface-container animate-pulse rounded" />
                  <div className="h-4 bg-surface-container animate-pulse rounded w-1/2" />
                  <div className="h-8 bg-surface-container animate-pulse rounded w-1/3 mt-4" />
                  <div className="h-12 bg-surface-container animate-pulse rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold mb-2">Failed to load listings</h3>
            <p className="text-on-surface-variant">{error}</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((listing) => {
              const badge = getConditionBadge(listing.condition_score || 0);
              const imageUrl =
                (listing.image_url && !listing.image_url.includes("via.placeholder.com"))
                  ? listing.image_url
                  : PLACEHOLDER_IMAGES[listing.category] || PLACEHOLDER_IMAGES.electronics;
              const isSold = listing.status === "sold";

              return (
                <article
                  key={listing.id}
                  className={`group glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col ${
                    isSold ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={listing.product_name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Condition Badge */}
                    <div
                      className={`absolute top-4 left-4 ${badge.className} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg`}
                    >
                      {badge.label}
                    </div>
                    {/* CO2 Badge */}
                    <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
                      <span className="text-primary text-sm">🌍</span>
                      <span className="text-xs font-bold text-primary">
                        {listing.co2_saved}kg CO₂ saved
                      </span>
                    </div>
                    {/* Sold Overlay */}
                    {isSold && (
                      <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
                        <span className="bg-error text-on-error px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
                          Sold
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-2xl font-semibold text-on-surface mb-2 leading-8">
                      {listing.product_name}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
                      {listing.ai_description ||
                        `${listing.verdict} grade item. Condition score: ${listing.condition_score}/100.`}
                    </p>
                    <div className="flex items-end gap-3 mb-6">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(listing.suggested_price)}
                      </span>
                      {listing.original_price > listing.suggested_price && (
                        <span className="text-outline line-through text-sm mb-1">
                          {formatPrice(listing.original_price)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => !isSold && handlePurchase(listing.id)}
                      disabled={isSold}
                      className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20 ${
                        isSold
                          ? "bg-outline text-surface cursor-not-allowed"
                          : "bg-primary text-on-primary hover:bg-on-secondary-fixed-variant"
                      }`}
                    >
                      <span>{isSold ? "Sold Out" : "Buy & Earn 150 Credits"}</span>
                      {!isSold && <span className="text-lg">💚</span>}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-surface-container-high rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">No listings match your filters</h3>
            <p className="text-on-surface-variant text-base mb-6 max-w-md mx-auto">
              Try adjusting your category, condition, or price filters to discover more
              second-life treasures.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Items");
                setConditionMin(0);
                setMaxPrice(50000);
                setSortBy("newest");
              }}
              className="px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-on-primary transition-all duration-300"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Explore More */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-12 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-on-primary transition-all duration-300"
            >
              Explore More Gems
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low border-t border-outline-variant/20">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-xl font-bold text-primary flex items-center gap-2">
            <span>🌿</span> SecondLife
          </div>
          <p className="text-sm font-semibold text-on-surface-variant max-w-xs text-center md:text-left">
            © 2024 SecondLife by Amazon. Circular economy for a greener planet.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-sm font-semibold text-on-surface-variant hover:text-secondary hover:underline transition-all" href="#">
            Sustainability Report
          </a>
          <a className="text-sm font-semibold text-on-surface-variant hover:text-secondary hover:underline transition-all" href="#">
            How it Works
          </a>
          <a className="text-sm font-semibold text-on-surface-variant hover:text-secondary hover:underline transition-all" href="#">
            Terms of Service
          </a>
          <a className="text-sm font-semibold text-on-surface-variant hover:text-secondary hover:underline transition-all" href="#">
            Help Center
          </a>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
            <span className="text-secondary">🌐</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
            <span className="text-secondary">📤</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
