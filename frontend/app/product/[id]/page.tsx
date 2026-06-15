"use client";
import { Search, Recycle, AlertTriangle, Leaf, CheckCircle, Package, Bot, Heart } from 'lucide-react';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  return_rate: number;
  risk_level: "low" | "medium" | "high";
  common_reasons: string[];
  refurb_available: boolean;
  refurb_price: number | null;
  prevention_tip: string;
}

const fallbackProducts: Product[] = [
  { id: "49a5bb33-491a-40fd-8bf8-3c7ae1742ba8", name: "Sony WH-1000XM5 Headphones", category: "electronics", price: 29990, image_url: null, return_rate: 18, common_return_reasons: ["Sound quality not as expected", "Uncomfortable fit", "Connectivity issues"], refurb_available: true, refurb_price: 21990, description: "Premium noise cancelling headphones" },
  { id: "845b773e-9cd6-44c4-8228-cf68fc9db0e0", name: "Nike Air Max Running Shoes", category: "clothing", price: 8995, image_url: null, return_rate: 34, common_return_reasons: ["Size runs small", "Different color than shown", "Sole defect"], refurb_available: true, refurb_price: 5995, description: "Lightweight running shoes" },
  { id: "38a3d713-1025-4c44-96a0-714c9b6f7e98", name: "Apple iPad 10th Gen", category: "electronics", price: 44900, image_url: null, return_rate: 12, common_return_reasons: ["Dead pixels", "Performance issues", "Not compatible"], refurb_available: true, refurb_price: 32900, description: "Powerful tablet for work and play" },
  { id: "d3ed85f7-d2ff-4a7f-800d-7dca16c5534b", name: "Prestige Pressure Cooker 5L", category: "home", price: 2499, image_url: null, return_rate: 8, common_return_reasons: ["Whistle defective", "Wrong size delivered"], refurb_available: false, refurb_price: null, description: "Durable stainless steel cooker" },
  { id: "f1a45e60-5279-414c-906b-2462b8298036", name: "Atomic Habits Book", category: "books", price: 399, image_url: null, return_rate: 5, common_return_reasons: ["Damaged pages", "Wrong edition"], refurb_available: false, refurb_price: null, description: "Bestselling self-improvement book" },
  { id: "f0ca88ae-487a-45fd-9e09-e14b6364a4e5", name: "Nivia Football Size 5", category: "sports", price: 1299, image_url: null, return_rate: 15, common_return_reasons: ["Air doesn't hold", "Size smaller than expected"], refurb_available: true, refurb_price: 799, description: "Professional match football" },
];

const fallbackRiskData: Record<string, RiskData> = {
  "49a5bb33-491a-40fd-8bf8-3c7ae1742ba8": { product_id: "49a5bb33-491a-40fd-8bf8-3c7ae1742ba8", return_rate: 18, risk_level: "medium", common_reasons: ["Sound quality not as expected", "Uncomfortable fit"], refurb_available: true, refurb_price: 21990, prevention_tip: "Check the fit guide before buying." },
  "845b773e-9cd6-44c4-8228-cf68fc9db0e0": { product_id: "845b773e-9cd6-44c4-8228-cf68fc9db0e0", return_rate: 34, risk_level: "high", common_reasons: ["Size runs small", "Different color"], refurb_available: true, refurb_price: 5995, prevention_tip: "Consider ordering half a size up based on recent returns." },
  "38a3d713-1025-4c44-96a0-714c9b6f7e98": { product_id: "38a3d713-1025-4c44-96a0-714c9b6f7e98", return_rate: 12, risk_level: "medium", common_reasons: ["Dead pixels", "Performance issues"], refurb_available: true, refurb_price: 32900, prevention_tip: "Check compatibility with your existing devices before purchasing." },
};

const PLACEHOLDER_IMAGES: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  clothing: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  home: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
  books: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
  sports: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
};

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { showToast, ToastComponent } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        // First try to find in products table
        const prodRes = await fetch(`${API_URL}/marketplace/products`);
        if (prodRes.ok) {
          const prods: Product[] = await prodRes.json();
          const found = prods.find((p) => p.id === id);
          if (found) {
            setProduct(found);
            // Fetch risk data for this product
            try {
              const riskRes = await fetch(`${API_URL}/prevention/risk/${id}`);
              if (riskRes.ok) {
                const data: RiskData = await riskRes.json();
                setRiskData(data);
              }
            } catch {}
            setLoading(false);
            return;
          }
        }

        // If not found in products, try listings table
        const listingRes = await fetch(`${API_URL}/marketplace/listings/${id}`);
        if (listingRes.ok) {
          const listing = await listingRes.json();
          // Convert listing to product shape
          const listingAsProduct: Product = {
            id: listing.id,
            name: listing.product_name || listing.product?.name || "Product",
            category: listing.category || listing.product?.category || "electronics",
            price: listing.original_price || listing.asking_price || 0,
            image_url: listing.image_url || listing.product?.image_url || null,
            return_rate: 15,
            common_return_reasons: ["General wear", "No longer needed"],
            refurb_available: true,
            refurb_price: listing.suggested_price || listing.asking_price || 0,
            description: listing.description || listing.ai_description || null,
          };
          setProduct(listingAsProduct);
          setRiskData({
            product_id: id,
            return_rate: 15,
            risk_level: "medium",
            common_reasons: ["General wear"],
            refurb_available: true,
            refurb_price: listing.suggested_price || listing.asking_price || 0,
            prevention_tip: "This is a pre-owned item already verified by SecondLife.",
          });
          setLoading(false);
          return;
        }

        throw new Error("Not found in products or listings");
      } catch (err) {
        const fallbackProd = fallbackProducts.find((p) => p.id === id) || fallbackProducts[0];
        setProduct(fallbackProd);
        setRiskData(
          fallbackRiskData[id] || {
            product_id: id,
            return_rate: fallbackProd.return_rate,
            risk_level: fallbackProd.return_rate > 25 ? "high" : fallbackProd.return_rate > 10 ? "medium" : "low",
            common_reasons: fallbackProd.common_return_reasons || [],
            refurb_available: fallbackProd.refurb_available,
            refurb_price: fallbackProd.refurb_price,
            prevention_tip: "Double check your requirements before purchasing.",
          }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-24 bg-slc-cloud text-center font-bold text-slc-steel">Loading product...</div>;
  }

  if (!product || !riskData) return null;

  const imageUrl = (product.image_url && !product.image_url.includes("placeholder"))
    ? product.image_url
    : PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES.electronics;

  const reasons = riskData.common_reasons || [];
  const fakePercentages = [45, 30, 15]; // Mock data for bar chart

  return (
    <div className="bg-slc-cloud min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slc-steel mb-4 uppercase tracking-wider font-semibold">
          Home &gt; {product.category} &gt; {product.name}
        </div>

        {/* 2-col Desktop Layout */}
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* LEFT COLUMN: Image */}
          <div className="w-full md:w-[55%]">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slc-smoke border border-slc-divider mb-4">
              <Image src={imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`relative w-20 h-20 rounded-md overflow-hidden border-2 cursor-pointer ${n === 1 ? 'border-slc-amber' : 'border-slc-divider'}`}>
                  <Image src={imageUrl} alt="thumb" fill className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slc-steel mt-4 flex items-center gap-1 font-semibold">
              <Search className="w-4 h-4 inline text-slc-steel" /> AI will analyze these photos when you initiate return
            </p>
          </div>

          {/* RIGHT COLUMN: Details */}
          <div className="w-full md:w-[45%] flex flex-col">
            
            {/* Amazon's Choice */}
            {product.id === "1" && (
              <div className="bg-slc-sky text-white text-xs font-bold px-2 py-0.5 rounded inline-block w-fit mb-2">
                Amazon&apos;s Choice <Recycle className="w-4 h-4 inline text-blue-500" /> for &apos;refurbished headphones&apos;
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-slc-ink leading-tight mb-2">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slc-amber text-lg tracking-widest">★★★★☆</span>
              <span className="text-slc-sky underline font-bold cursor-pointer">4.2</span>
              <span className="text-slc-sky text-sm cursor-pointer">(438 ratings)</span>
            </div>

            <div className="border-t border-slc-divider my-3" />

            {/* Price Block */}
            <div className="mb-4">
              <p className="text-slc-steel text-sm line-through">M.R.P.: ₹{product.price.toLocaleString('en-IN')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-slc-steel text-sm">SecondLife Price:</span>
                <span className="text-slc-red text-3xl font-bold font-mono">
                  ₹{(riskData.refurb_available && riskData.refurb_price ? riskData.refurb_price : product.price).toLocaleString('en-IN')}
                </span>
              </div>
              {riskData.refurb_available && riskData.refurb_price && (
                <p className="text-slc-red text-sm font-semibold">
                  You Save: ₹{(product.price - riskData.refurb_price).toLocaleString('en-IN')} ({Math.round(((product.price - riskData.refurb_price) / product.price) * 100)}%)
                </p>
              )}
              <p className="text-slc-steel text-xs mt-1">Inclusive of all taxes</p>
            </div>

            {/* RETURN RISK BANNER */}
            {riskData.return_rate > 10 && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-8 h-8 text-slc-amber" />
                  <div>
                    <p className="font-bold text-amber-900">{riskData.return_rate}% of buyers return this item</p>
                    <p className="text-sm text-amber-800/80 font-medium">Most common reason: {reasons[0] || "Doesn't meet expectations"}</p>
                    {riskData.prevention_tip && (
                      <p className="text-sm text-slc-leaf font-bold mt-1 flex items-center gap-1.5"><Leaf className="w-4 h-4" /> Tip: {riskData.prevention_tip}</p>
                    )}
                  </div>
                </div>
                {riskData.refurb_available && (
                  <button className="text-slc-leaf text-sm underline font-bold mt-2 ml-9">
                    See Certified Refurb Alternative →
                  </button>
                )}
              </div>
            )}

            {/* PRODUCT HEALTH CARD */}
            <div className="bg-slc-leaf-light border border-slc-leaf/30 rounded-xl p-5 mb-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-slc-leaf flex items-center gap-2">
                  <span>📋</span> SecondLife Product Health Card
                </h3>
                <p className="text-xs text-slc-leaf-dark font-medium">AI-verified before every listing</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 text-center border border-slc-divider">
                  <p className="text-[10px] uppercase font-bold text-slc-steel tracking-wider mb-1">Condition Score</p>
                  <p className="text-2xl font-bold text-slc-leaf font-mono leading-none">9.2 <span className="text-sm text-slc-steel font-sans">/ 10</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slc-divider">
                  <p className="text-[10px] uppercase font-bold text-slc-steel tracking-wider mb-1">AI Grade</p>
                  <p className="text-lg font-bold text-slc-ink leading-none mt-1 flex items-center gap-1">Good <CheckCircle className="w-4 h-4 text-slc-leaf" /></p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slc-divider">
                  <p className="text-[10px] uppercase font-bold text-slc-steel tracking-wider mb-1">Warranty</p>
                  <p className="text-sm font-bold text-slc-ink mt-1">6 months left</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slc-divider">
                  <p className="text-[10px] uppercase font-bold text-slc-steel tracking-wider mb-1">Return History</p>
                  <p className="text-sm font-bold text-slc-ink mt-1">First return</p>
                </div>
              </div>

              {/* Life Path Indicator */}
              <div className="life-path justify-between px-2 pt-2 border-t border-slc-leaf/20">
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full"><Package className="w-5 h-5 text-slc-steel" /></div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Return</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full"><Bot className="w-5 h-5 text-slc-amber" /></div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Grade</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full"><CheckCircle className="w-5 h-5 text-slc-leaf" /></div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Route</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-slc-leaf text-white rounded-full"><Heart className="w-5 h-5 fill-current" /></div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Earn</span>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/verify/${product.id}`)}
                className="w-full bg-white border border-slc-leaf/30 text-slc-leaf text-xs font-bold py-2.5 rounded-lg hover:bg-slc-cloud transition-colors mt-4 shadow-sm flex justify-center items-center gap-2"
              >
                <span>↗</span> View Public Certificate
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3">
              <button onClick={() => showToast("Added to Cart")} className="w-full bg-slc-amber hover:bg-yellow-500 text-slc-ink font-bold py-3 rounded-full shadow-sm transition-colors text-sm">
                Add to Cart
              </button>
              <button onClick={() => showToast("Proceeding to checkout")} className="w-full bg-slc-amber/80 hover:bg-slc-amber text-slc-ink font-bold py-3 rounded-full shadow-sm transition-colors text-sm">
                Buy Now
              </button>
            </div>

            <p className="text-xs text-slc-steel mt-5 font-medium">
              Ships from and sold by SecondLife by Amazon
            </p>

          </div>
        </div>

        {/* BELOW THE FOLD */}
        <div className="mt-12 max-w-3xl">
        </div>

      </div>
      <ToastComponent />
    </div>
  );
}
