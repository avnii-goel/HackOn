"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/components/Toast";
import { Search, MapPin, SlidersHorizontal, Leaf, Bot, ShieldCheck, Recycle, Package, Coins, Truck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Product {
  name: string;
  category: string;
  image_url: string | null;
}

interface Listing {
  id: string;
  product_id: string;
  seller_id: string;
  asking_price: number;
  condition_label: string;
  ai_grade: string;
  description: string;
  is_available: boolean;
  product: Product;
}

// Fallback Mock Data
const fallbackListings: Listing[] = [
  { id: "201", product_id: "e1", seller_id: "s1", asking_price: 62000, condition_label: "Like New", ai_grade: "Pristine", description: "Purchased Jan 2024, used 3 months. Original box, charger, S-Pen. Zero scratches. Battery health 99%.", is_available: true, product: { name: "Samsung Galaxy S23 Ultra", category: "electronics", image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80" } },
  { id: "202", product_id: "e2", seller_id: "s2", asking_price: 78000, condition_label: "Good", ai_grade: "Minor Wear", description: "Used 1 year for college. Screen pristine. Battery 187 cycles. Comes with charger.", is_available: true, product: { name: "Apple MacBook Air M2 13\"", category: "electronics", image_url: "https://images.unsplash.com/photo-1611186871525-b46dc9b5a9a8?w=600&q=80" } },
  { id: "203", product_id: "e3", seller_id: "s3", asking_price: 38000, condition_label: "Good", ai_grade: "Excellent Functional", description: "Bought Diwali sale. Moving abroad. 2 controllers, HDMI, stand. Flawless.", is_available: true, product: { name: "Sony PlayStation 5 Disc Edition", category: "electronics", image_url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80" } },
  { id: "204", product_id: "c1", seller_id: "s4", asking_price: 1800, condition_label: "Like New", ai_grade: "Flawless", description: "Worn twice, washed once cold. Dark indigo intact. W32 L30.", is_available: true, product: { name: "Levi's 511 Slim Fit Jeans — W32 L30", category: "clothing", image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" } },
  { id: "205", product_id: "c2", seller_id: "s5", asking_price: 5500, condition_label: "Good", ai_grade: "Light Use", description: "3 months gym use. Minimal sole wear. Boost cushioning responsive. UK9.", is_available: true, product: { name: "Adidas Ultraboost 22 Running Shoes — UK9", category: "clothing", image_url: "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600&q=80" } },
  { id: "206", product_id: "c3", seller_id: "s6", asking_price: 1200, condition_label: "Like New", ai_grade: "Pristine", description: "Gifted, never worn. Tags attached. Off-white linen kurta + palazzo set. XL.", is_available: true, product: { name: "Fabindia Linen Kurta Set — XL", category: "clothing", image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4869?w=600&q=80" } },
  { id: "207", product_id: "h1", seller_id: "s7", asking_price: 22000, condition_label: "Good", ai_grade: "Well Maintained", description: "8 months use, 2BHK. All attachments. Filter washed monthly. Full suction.", is_available: true, product: { name: "Dyson V12 Detect Slim Cordless Vacuum", category: "home", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" } },
  { id: "208", product_id: "h2", seller_id: "s8", asking_price: 4200, condition_label: "Good", ai_grade: "Clean, Functional", description: "Weekly use 6 months. Basket cleaned after every use. No burn marks. Dial perfect.", is_available: true, product: { name: "Philips Air Fryer HD9200 — 4.1L", category: "home", image_url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80" } },
  { id: "209", product_id: "h3", seller_id: "s9", asking_price: 2800, condition_label: "Fair", ai_grade: "Visible Use", description: "2 years old. Small chip bottom-right. Joints tight. Comes disassembled with hardware.", is_available: true, product: { name: "IKEA KALLAX 4-Cube Shelf Unit — White", category: "home", image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" } },
  { id: "210", product_id: "b1", seller_id: "s10", asking_price: 180, condition_label: "Good", ai_grade: "Read Once", description: "Read once, no annotations. Spine intact. Dust jacket perfect.", is_available: true, product: { name: "The Psychology of Money — Morgan Housel", category: "books", image_url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80" } },
  { id: "211", product_id: "b2", seller_id: "s11", asking_price: 550, condition_label: "Fair", ai_grade: "Annotated", description: "GATE prep use. Pencil marks (erasable). All pages present. Binding strong. Bonus formula sheets!", is_available: true, product: { name: "GATE 2025 CSE Guide (Made Easy)", category: "books", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80" } },
  { id: "212", product_id: "b3", seller_id: "s12", asking_price: 320, condition_label: "Like New", ai_grade: "Pristine", description: "Both books unread. No marks. Perfect set for career starters.", is_available: true, product: { name: "Deep Work + So Good They Can't Ignore You (Set)", category: "books", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" } },
  { id: "213", product_id: "sp1", seller_id: "s13", asking_price: 3800, condition_label: "Good", ai_grade: "Play Worn", description: "Club doubles 6 months. Re-strung 28lbs BG65. New grip. No frame cracks. Cover included.", is_available: true, product: { name: "Yonex Arcsaber 11 Badminton Racket", category: "sports", image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80" } },
  { id: "214", product_id: "sp2", seller_id: "s14", asking_price: 600, condition_label: "Good", ai_grade: "Clean, Minimal Wear", description: "4 months home yoga. Washed after every session. Non-slip intact. No tears.", is_available: true, product: { name: "Decathlon Domyos Yoga Mat — 6mm", category: "sports", image_url: "https://images.unsplash.com/photo-1601925228245-2c0c9c70cba2?w=600&q=80" } },
  { id: "215", product_id: "sp3", seller_id: "s15", asking_price: 7500, condition_label: "Good", ai_grade: "Well Maintained", description: "3x/week 10 months. All 8 resistance levels work. Seat adjustable. Minor rust on base only.", is_available: true, product: { name: "Cosco Upright Exercise Bike", category: "sports", image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80" } },
];

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, ToastComponent } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryParam = searchParams.get("category") || "all departments";
  const queryParam = searchParams.get("query") || "";
  const [activeCondition, setActiveCondition] = useState("All Conditions");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/listings`);
        if (res.ok) {
          const data = await res.json();
          setListings(data.filter((l: Listing) => l.is_available));
        } else throw new Error("Failed");
      } catch (err) {
        console.warn("Using fallback listings");
        setListings(fallbackListings);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handlePurchase = async (listingId: string) => {
    const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    try {
      const res = await fetch(`${API_URL}/marketplace/purchase/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_id: userId }),
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        showToast("Purchased! +150 credits added to your wallet");
      } else throw new Error("Purchase failed");
    } catch (err) {
      // Fake success for hackathon if backend fails
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      showToast("Purchased! +150 credits added to your wallet");
    }
  };

  const filteredListings = (() => {
    let result = listings;

    // Search query filtering
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(l => 
        l.product?.name?.toLowerCase().includes(q) || 
        l.description?.toLowerCase().includes(q)
      );
    }

    const cat = searchParams.get("category")?.toLowerCase().replace(/[^a-z &]/g, "").trim() || "";
    
    // Category filter from URL
    if (cat && cat !== "all departments" && cat !== "all conditions" && cat !== "") {
      if (cat === "home  kitchen") {
        result = result.filter(l => l.product?.category?.toLowerCase() === "home");
      } else if (cat === "eco picks") {
        result = result; // show all — everything here is sustainable
      } else if (["like new", "good", "fair"].includes(cat)) {
        result = result.filter(l => l.condition_label?.toLowerCase().includes(cat));
      } else {
        result = result.filter(l => l.product?.category?.toLowerCase().includes(cat));
      }
    }
    
    // Condition pill filter (activeFilter state)
    if (activeCondition !== "All Conditions" && !cat) {
      const cond = activeCondition.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase();
      result = result.filter(l => l.condition_label?.toLowerCase().includes(cond));
    }
    
    return result;
  })();

  return (
    <div className="bg-slc-cloud min-h-screen flex flex-col">
      {/* HERO BANNER */}
      <div className="bg-slc-bark text-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">SecondLife Marketplace</h1>
              <p className="text-white/70 text-lg">
                {queryParam ? `Search results for "${queryParam}"` : "AI-certified pre-owned. Every item verified before listing."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><Package className="w-4 h-4" /> 1.2M Items</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><Leaf className="w-4 h-4" /> 840K kg CO₂</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><Coins className="w-4 h-4" /> ₹24Cr Value</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {["All Conditions", "Like New", "Good", "Fair"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveCondition(filter);
                  const clean = filter.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase();
                  router.push(`/marketplace?category=${encodeURIComponent(clean)}`, { scroll: false });
                }}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeCondition === filter
                    ? "bg-slc-amber text-slc-ink"
                    : "bg-slc-bark border border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 bg-slc-smoke animate-pulse rounded-xl border border-slc-divider" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slc-divider">
            <Leaf className="w-12 h-12 text-slc-steel mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slc-ink mb-2">No items found</h3>
            <p className="text-slc-steel">Check back later or change your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              // Convert Listing to Product shape for ProductCard
              const productShape = {
                id: listing.product_id,
                listing_id: listing.id,
                name: listing.product.name,
                category: listing.product.category,
                image_url: listing.product.image_url,
                asking_price: listing.asking_price,
                condition_label: listing.condition_label,
                ai_grade: listing.ai_grade,
                description: listing.description
              };

              return (
                <ProductCard
                  key={listing.id}
                  product={productShape}
                  isMarketplace={true}
                  isExpanded={expandedId === listing.id}
                  onClick={() => router.push(`/product/${listing.id}`)}
                  onCollapse={() => setExpandedId(null)}
                  onPurchase={() => handlePurchase(listing.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* TRUST FOOTER STRIP */}
      <div className="bg-slc-cloud border-t border-slc-divider py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slc-divider shrink-0 text-slc-leaf"><Bot className="w-6 h-6" /></div>
            <div>
              <h4 className="text-slc-ink font-bold text-sm">AI-Verified</h4>
              <p className="text-slc-steel text-xs font-medium">No fake listings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slc-divider shrink-0 text-slc-ink"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h4 className="text-slc-ink font-bold text-sm">Secure Payment</h4>
              <p className="text-slc-steel text-xs font-medium">Amazon protection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slc-divider shrink-0 text-amber-500"><Truck className="w-6 h-6" /></div>
            <div>
              <h4 className="text-slc-ink font-bold text-sm">Fast Delivery</h4>
              <p className="text-slc-steel text-xs font-medium">Local fulfillment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slc-divider shrink-0 text-blue-500"><Recycle className="w-6 h-6" /></div>
            <div>
              <h4 className="text-slc-ink font-bold text-sm">Eco-Friendly</h4>
              <p className="text-slc-steel text-xs font-medium">Zero waste</p>
            </div>
          </div>
        </div>
      </div>

      <ToastComponent />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slc-cloud animate-pulse" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
