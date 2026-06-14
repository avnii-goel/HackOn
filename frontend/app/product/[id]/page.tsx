"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { getProducts, getReturnRisk } from "@/lib/api";

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

interface RiskData {
  product_id: string;
  product_name: string;
  risk_score: number;
  primary_reason: string;
  suggestion: string;
  prevention_tip: string;
  refurb_available: boolean;
  refurb_price: number | null;
  category: string;
}

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

const THUMBNAIL_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAyO1nz4lhhq58Ob7JfzYBhVvGDhzAXycKACSA7Vr6VGG_ywVY1zZBQur1fnPesb-4LeRurDmT2zusRoxwLnPLKzOyz1MhAeNpIEa2SX-rcn9G26KCND0kj3VtljPW359X3jktFP6jkpk5D5jbCNVVjnBjsVIt1TZPaPGDiHCqkd-HUrzV5xmMvzXH-dx78ERZ0NW9uNsm-dQk5SU2ZxORdGTvCwGZpvTjDUUkfn54v-C4OblGoX1Yh3qL_BL32UoTU_hVFL9Zcm8c",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuApbriCdyoGJvXY9fq7dxfIhPWBp_jlbYm5vOl4JQthJzdC84rYk4LNbsNM5JmP-wdmXlD-_W8nfj5NGELu1KW4KPAnCoUIwXi0cH8ZbhVscIRxfG_ZwLq9XixICKdUfxqvuY7-T7eduIG7y-vG4qaPDUAsXTPz0Z5SCFOnX9MGVZ0I631uUGgj1zxLcUzJz-SMs_pVyPtxbTQaPi3HUI4K5ws9Q2JFs0EOIMdsf5GV-qiC9N2V_G7rK2YqO2RZKTWQHvcTrb_tc08",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvH-G9sHnKEFL8vgH_TB6WWkVS-PtG31dGHNikCvrrS-TfRHJPjOVI1WdxxAtfNlzCKkU30C07RpHDPgmE1YddvDUed9U83hT72DVjk3JHOtePUFZH6KLmrV1ob6fuezSMURBtFXC4g6cFZLG1TVmCEdTo0uRGvJ9LU3hqmoR2c8MKGBrEO-h7W6-qv8no1OogNzGyidboVpxlFCkTl7wdwktxBXZtZFgO8T4LStqPpGgg1Hs-fJG880ffOoYlH2TZh_K_bttXXk8",
];

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function capitalizeCategory(cat: string): string {
  if (cat === "home") return "Home & Kitchen";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function getDiscountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [riskVisible, setRiskVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, riskData] = await Promise.all([
          getProducts(),
          getReturnRisk(productId).catch(() => null),
        ]);

        const found = products.find((p: Product) => p.id === productId);
        if (!found) throw new Error("Product not found");
        setProduct(found);

        if (riskData) {
          setRisk(riskData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Animate risk banner entrance
  useEffect(() => {
    if (risk && !loading) {
      const timer = setTimeout(() => setRiskVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [risk, loading]);

  const handleBuyNow = () => {
    toast.success("Purchase successful! 🎉", {
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: 600,
      },
    });
  };

  const handleReturn = () => {
    router.push(`/return/${productId}`);
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen">
        {/* Nav skeleton */}
        <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
          <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <span>🌿</span> SecondLife
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto pt-24 pb-16 px-6">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-10">
            <div className="md:col-span-6 space-y-6">
              <div className="aspect-square bg-surface-container rounded-xl animate-pulse" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-surface-container rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="md:col-span-4 space-y-6">
              <div className="h-10 bg-surface-container rounded animate-pulse" />
              <div className="h-6 bg-surface-container rounded w-2/3 animate-pulse" />
              <div className="h-8 bg-surface-container rounded w-1/2 animate-pulse" />
              <div className="h-32 bg-surface-container rounded-xl animate-pulse" />
              <div className="h-32 bg-surface-container rounded-xl animate-pulse" />
              <div className="h-14 bg-surface-container rounded-xl animate-pulse" />
              <div className="h-14 bg-surface-container rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold mb-2">Product not found</h3>
          <p className="text-on-surface-variant mb-6">{error || "This product doesn't exist."}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const mainImage = (product.image_url && !product.image_url.includes("via.placeholder.com"))
    ? product.image_url
    : PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES.electronics;
  const allImages = [mainImage, ...THUMBNAIL_IMAGES];
  const displayPrice = product.refurb_available && product.refurb_price ? product.refurb_price : product.price;
  const discount = product.refurb_price ? getDiscountPercent(product.price, product.refurb_price) : 0;
  const conditionScore = risk ? Math.min(100 - risk.risk_score, 100) : 92;
  const gaugeOffset = 219.9 - (219.9 * conditionScore) / 100;

  return (
    <div className="bg-background text-on-background overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div
            className="text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span>🌿</span> SecondLife
          </div>
          <div className="hidden md:flex items-center gap-6 text-base">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="/">
              Home
            </a>
            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">
              Marketplace
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Dashboard
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-primary-container/10 rounded-full text-primary font-bold text-sm">
              💚 450 pts
            </div>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4-0PkPHmpXIO4D-vTiFiLRUOtVHp70_jbzsxOXdB1dQK6e7Wj0i65sIumEyDgWJ9XWFXRQC2Ci09f3moenVUv4Z0YrDeO-YE068v7V9x2wNhCVqD7SVpLiBdW251iIgDmsoeQFmH3YdLc7wXGen3T-atMYyZhn-hyUjNDlskJIRQW1PZt70uw3HTkmnkRG6ojzmBIevdltEgaZuCQ4JuvwsKzUc0K1Yr027__rg4kaZXRNwG8x8PEUsG1Wbgv_zM96QG5HlD3Bdo"
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full border-2 border-primary hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto pt-24 pb-16 px-6 min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-on-surface-variant text-sm font-semibold tracking-wide">
          <a className="hover:text-primary" href="/">
            Home
          </a>
          <span className="text-xs">›</span>
          <a className="hover:text-primary" href="/">
            Marketplace
          </a>
          <span className="text-xs">›</span>
          <span className="text-on-surface">{capitalizeCategory(product.category)}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-10">
          {/* 60% Left: Media Gallery */}
          <div className="md:col-span-6 space-y-6">
            <div className="relative aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm group">
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-xl border border-white/20">
                  {capitalizeCategory(product.category)}
                </span>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-xl border border-white/20">
                  Sustainability Choice
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {allImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square bg-surface-container rounded-lg overflow-hidden border-2 hover:opacity-80 transition-all ${
                    selectedImage === i ? "border-primary" : "border-outline-variant"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} width={150} height={150} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 40% Right: Product Info & Actions */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Title & Price */}
            <section>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight leading-10">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-500">
                  {"★★★★".split("").map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                  <span className="text-lg text-amber-300">★</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">4.2</span>
                <span className="text-on-surface-variant text-sm font-semibold">(1.2k Reviews)</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-on-surface">
                  {formatPrice(displayPrice)}
                </span>
                {product.refurb_price && (
                  <>
                    <span className="text-base text-on-surface-variant line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-primary font-bold text-sm">{discount}% OFF</span>
                  </>
                )}
              </div>
            </section>

            {/* Return Risk Banner */}
            {risk && (
              <div
                className={`transition-all duration-500 ease-out ${
                  riskVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                } ${
                  risk.risk_score > 60
                    ? "p-6 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 shadow-sm"
                    : risk.risk_score >= 30
                    ? "p-6 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm"
                    : "p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm"
                } relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 blur-2xl rounded-full" />
                <div className="flex gap-3 items-start relative z-10">
                  <span className="mt-0.5 text-xl">
                    {risk.risk_score > 60 ? "🔴" : risk.risk_score >= 30 ? "⚠️" : "✅"}
                  </span>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-semibold tracking-wide ${
                        risk.risk_score > 60
                          ? "text-red-900"
                          : risk.risk_score >= 30
                          ? "text-amber-900"
                          : "text-green-900"
                      }`}
                    >
                      {risk.risk_score}% of buyers return this product
                    </h3>
                    <p
                      className={`text-base mt-1 ${
                        risk.risk_score > 60
                          ? "text-red-800/80"
                          : risk.risk_score >= 30
                          ? "text-amber-800/80"
                          : "text-green-800/80"
                      }`}
                    >
                      Common reason: <span className="font-bold">{risk.primary_reason}</span>.{" "}
                      {risk.prevention_tip}
                    </p>
                    <button
                      className={`mt-3 text-sm font-semibold flex items-center gap-1 hover:underline ${
                        risk.risk_score > 60
                          ? "text-red-700"
                          : risk.risk_score >= 30
                          ? "text-amber-700"
                          : "text-green-700"
                      }`}
                    >
                      {risk.suggestion} <span className="text-xs">↗</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Certified Refurbished Card */}
            {product.refurb_available && product.refurb_price && (
              <div className="p-6 rounded-xl border-2 border-primary bg-surface shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary text-xl">✓</span>
                      <span className="text-2xl font-bold text-on-surface leading-8">
                        Certified Refurbished
                      </span>
                    </div>
                    <p className="mt-2 text-primary font-bold text-sm tracking-wide">
                      Save {formatPrice(product.price - product.refurb_price)} + Earn 150 Credits
                    </p>
                  </div>
                  {/* Condition Gauge */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="transparent"
                        strokeWidth="4"
                        stroke="#E5E7EB"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="transparent"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="url(#gaugeGradient)"
                        strokeDasharray="219.9"
                        strokeDashoffset={gaugeOffset}
                        className="transition-all duration-1000 ease-in-out"
                      />
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-bold text-xs text-on-surface">{conditionScore}</span>
                      <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">
                        {conditionScore >= 80 ? "Excellent" : conditionScore >= 60 ? "Good" : "Fair"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-base text-on-surface-variant italic">
                  &ldquo;AI-graded: {conditionScore >= 80 ? "Excellent" : conditionScore >= 60 ? "Good" : "Fair"} ({conditionScore}/100). Professionally inspected and sanitized.&rdquo;
                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleBuyNow}
                className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>🛒</span> Buy Now
              </button>
              <button
                onClick={handleReturn}
                className="w-full h-14 border-2 border-error text-error bg-transparent rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>↩️</span> Return This Item
              </button>
              <p className="text-center text-sm font-semibold text-on-surface-variant mt-2 flex items-center justify-center gap-1">
                <span>🌿</span> Purchasing this saves 4.5kg of CO₂ emissions.
              </p>
            </div>
          </div>
        </div>

        {/* Asymmetric Detail Section (Bento Grid) */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-16 rounded-2xl bg-inverse-surface text-surface flex flex-col justify-center relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-5xl font-bold leading-tight tracking-tight mb-4">
                Circular Journey
              </h2>
              <p className="text-lg text-surface/80 max-w-lg leading-7">
                Track the entire history of this item. From its first life to our rigorous
                32-point inspection and restoration process. This is the future of conscious
                consumption.
              </p>
              <button className="mt-10 px-6 py-3 bg-primary-container text-on-primary-container rounded-full font-bold flex items-center gap-2 w-fit hover:scale-[1.02] shadow-xl transition-transform">
                View Blockchain Trace <span>📜</span>
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface shadow-sm border border-outline-variant/20 flex items-center gap-4 group hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Plastic-free packaging</h4>
                <p className="text-sm font-semibold text-on-surface-variant tracking-wide">
                  Shipped in mushroom foam
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-surface shadow-sm border border-outline-variant/20 flex items-center gap-4 group hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="text-xl">🔄</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Buyback Guarantee</h4>
                <p className="text-sm font-semibold text-on-surface-variant tracking-wide">
                  Resell back to us for ₹3,000
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-surface shadow-sm border border-outline-variant/20 flex items-center gap-4 group hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <span className="text-xl">🛠️</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Repair Support</h4>
                <p className="text-sm font-semibold text-on-surface-variant tracking-wide">
                  Free repairs for 1 year
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low border-t border-outline-variant/20">
        <div className="text-xl font-bold text-primary">SecondLife</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-on-surface-variant hover:text-secondary hover:underline transition-all text-sm font-semibold" href="#">
            Sustainability Report
          </a>
          <a className="text-on-surface-variant hover:text-secondary hover:underline transition-all text-sm font-semibold" href="#">
            How it Works
          </a>
          <a className="text-on-surface-variant hover:text-secondary hover:underline transition-all text-sm font-semibold" href="#">
            Terms of Service
          </a>
          <a className="text-on-surface-variant hover:text-secondary hover:underline transition-all text-sm font-semibold" href="#">
            Help Center
          </a>
        </div>
        <div className="text-on-surface-variant text-sm font-semibold opacity-60">
          © 2024 SecondLife by Amazon. Circular economy for a greener planet.
        </div>
      </footer>
    </div>
  );
}
