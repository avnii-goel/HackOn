"use client";

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
  { id: "1", name: "Sony WH-1000XM5 Headphones", category: "electronics", price: 29990, image_url: null, return_rate: 18, common_return_reasons: ["Sound quality not as expected", "Uncomfortable fit", "Connectivity issues"], refurb_available: true, refurb_price: 21990, description: "Premium noise cancelling headphones" },
  { id: "2", name: "Nike Air Max Running Shoes", category: "clothing", price: 8995, image_url: null, return_rate: 34, common_return_reasons: ["Size runs small", "Different color than shown", "Sole defect"], refurb_available: true, refurb_price: 5995, description: "Lightweight running shoes" },
  { id: "3", name: "Apple iPad 10th Gen", category: "electronics", price: 44900, image_url: null, return_rate: 12, common_return_reasons: ["Dead pixels", "Performance issues", "Not compatible"], refurb_available: true, refurb_price: 32900, description: "Powerful tablet for work and play" },
];

const fallbackRiskData: Record<string, RiskData> = {
  "1": { product_id: "1", return_rate: 18, risk_level: "medium", common_reasons: ["Sound quality not as expected", "Uncomfortable fit"], refurb_available: true, refurb_price: 21990, prevention_tip: "Check the fit guide before buying." },
  "2": { product_id: "2", return_rate: 34, risk_level: "high", common_reasons: ["Size runs small", "Different color"], refurb_available: true, refurb_price: 5995, prevention_tip: "Consider ordering half a size up based on recent returns." },
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
        const prodRes = await fetch(`${API_URL}/marketplace/products`);
        if (prodRes.ok) {
          const prods: Product[] = await prodRes.json();
          const found = prods.find((p) => p.id === id);
          if (found) setProduct(found);
          else throw new Error("Not found");
        } else throw new Error("Failed");

        const riskRes = await fetch(`${API_URL}/prevention/risk/${id}`);
        if (riskRes.ok) {
          const data: RiskData = await riskRes.json();
          setRiskData(data);
        } else throw new Error("Failed risk");
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
              <span className="text-sm">🔍</span> AI will analyze these photos when you initiate return
            </p>
          </div>

          {/* RIGHT COLUMN: Details */}
          <div className="w-full md:w-[45%] flex flex-col">
            
            {/* Amazon's Choice */}
            {product.id === "1" && (
              <div className="bg-slc-sky text-white text-xs font-bold px-2 py-0.5 rounded inline-block w-fit mb-2">
                Amazon&apos;s Choice ♻️ for &apos;refurbished headphones&apos;
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
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-bold text-amber-900">{riskData.return_rate}% of buyers return this item</p>
                    <p className="text-sm text-amber-800/80 font-medium">Most common reason: {reasons[0] || "Doesn't meet expectations"}</p>
                    {riskData.prevention_tip && (
                      <p className="text-sm text-slc-leaf font-bold mt-1">🌿 Tip: {riskData.prevention_tip}</p>
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
                  <p className="text-lg font-bold text-slc-ink leading-none mt-1">Good ✅</p>
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
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full">📦</div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Return</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full">🤖</div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Grade</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-white border border-slc-leaf/20 rounded-full">✅</div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Route</span>
                </div>
                <div className="life-path-line bg-slc-leaf/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="life-path-dot bg-slc-leaf text-white rounded-full">💚</div>
                  <span className="text-[9px] font-bold text-slc-leaf-dark uppercase">Earn</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3">
              <button onClick={() => showToast("Added to Cart")} className="w-full bg-slc-amber hover:bg-yellow-500 text-slc-ink font-bold py-3 rounded-full shadow-sm transition-colors text-sm">
                Add to Cart
              </button>
              <button onClick={() => showToast("Proceeding to checkout")} className="w-full bg-slc-amber/80 hover:bg-slc-amber text-slc-ink font-bold py-3 rounded-full shadow-sm transition-colors text-sm">
                Buy Now
              </button>
              
              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-slc-divider flex-1" />
                <span className="text-xs text-slc-steel font-bold uppercase">or</span>
                <div className="h-px bg-slc-divider flex-1" />
              </div>

              <button 
                onClick={() => router.push(`/return/${product.id}`)}
                className="w-full border border-slc-divider text-slc-steel hover:bg-slc-cloud font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                ↩ Return This Item
              </button>
              <p className="text-xs text-slc-leaf font-semibold text-center">
                🌿 Choosing resell earns you 200 Green Credits
              </p>
            </div>

            <p className="text-xs text-slc-steel mt-5 font-medium">
              Ships from and sold by SecondLife by Amazon
            </p>

          </div>
        </div>

        {/* BELOW THE FOLD */}
        <div className="mt-12 max-w-3xl">
          
          {/* Why People Return This */}
          {reasons.length > 0 && (
            <div className="bg-white rounded-xl border border-slc-divider p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-slc-ink text-lg mb-4">Why People Return This</h3>
              <div className="space-y-4">
                {reasons.slice(0, 3).map((reason, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-semibold text-slc-ink mb-1">
                      <span>{reason}</span>
                      <span>{fakePercentages[idx] || 10}%</span>
                    </div>
                    <div className="h-2 w-full bg-slc-smoke rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slc-amber rounded-full" 
                        style={{ width: `${fakePercentages[idx] || 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before You Return */}
          {riskData.refurb_available && (
            <div className="bg-slc-leaf-light rounded-xl p-6 border border-slc-leaf/20 shadow-sm">
              <h3 className="font-bold text-slc-leaf-dark text-lg mb-4 flex items-center gap-2">
                💡 Customers who chose SecondLife instead of returning:
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="bg-white rounded-lg p-3 flex-1 text-center border border-slc-leaf/10 shadow-sm">
                  <p className="text-xs text-slc-steel font-bold uppercase">Saved</p>
                  <p className="text-lg font-bold text-slc-leaf">₹{(product.price - (riskData.refurb_price || 0)).toLocaleString('en-IN')} avg</p>
                </div>
                <div className="bg-white rounded-lg p-3 flex-1 text-center border border-slc-leaf/10 shadow-sm">
                  <p className="text-xs text-slc-steel font-bold uppercase">Earned</p>
                  <p className="text-lg font-bold text-slc-leaf">200 💚 credits</p>
                </div>
                <div className="bg-white rounded-lg p-3 flex-1 text-center border border-slc-leaf/10 shadow-sm">
                  <p className="text-xs text-slc-steel font-bold uppercase">Sold In</p>
                  <p className="text-lg font-bold text-slc-leaf">&lt;48 hrs avg</p>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/return/${product.id}`)}
                className="w-full bg-slc-leaf hover:bg-slc-leaf-dark text-white text-lg font-bold py-4 rounded-xl shadow-md transition-colors"
              >
                Resell Instead of Returning → Earn 200 Credits
              </button>
            </div>
          )}
        </div>

      </div>
      <ToastComponent />
    </div>
  );
}
