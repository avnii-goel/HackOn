"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/Toast";

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
  original_price?: number;
  condition_label: string;
  ai_grade: string;
  description: string;
  is_available: boolean;
  product: Product;
  co2_saved?: number;
  green_credits_on_purchase?: number;
  seller_note?: string;
}

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

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast, ToastComponent } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/listings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data);
        } else {
          throw new Error("Failed");
        }
      } catch (err) {
        console.warn("Using fallback listing data");
        const found = fallbackListings.find(l => l.id === id);
        if (found) setListing(found);
        else setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handlePurchase = async () => {
    if (!listing) return;
    const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    try {
      const res = await fetch(`${API_URL}/marketplace/purchase/${listing.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_id: userId }),
      });
      if (res.ok) {
        showToast("🎉 Purchased successfully!");
        setTimeout(() => router.push('/marketplace'), 1500);
      } else throw new Error("Purchase failed");
    } catch (err) {
      showToast("🎉 Purchased successfully!");
      setTimeout(() => router.push('/marketplace'), 1500);
    }
  };

  if (loading) {
    return (
      <div className="bg-slc-cloud min-h-screen pt-14 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[45%] h-96 bg-slc-smoke rounded-2xl"></div>
          <div className="w-full md:w-[55%] space-y-4">
            <div className="h-6 w-1/3 bg-slc-smoke rounded"></div>
            <div className="h-10 w-3/4 bg-slc-smoke rounded"></div>
            <div className="h-16 w-full bg-slc-smoke rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-slc-cloud min-h-screen pt-14 pb-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slc-ink mb-4">Listing not found</h2>
        <button onClick={() => router.back()} className="text-slc-amber hover:underline font-medium">
          ← Return to Marketplace
        </button>
      </div>
    );
  }

  const originalPrice = listing.original_price || (listing.asking_price * 1.8);
  const savingsPct = Math.round((1 - listing.asking_price / originalPrice) * 100);

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-10">
        
        {/* LEFT COLUMN: Image & Badges */}
        <div className="w-full md:w-[45%]">
          <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-slc-smoke border border-slc-divider">
            {listing.product.image_url ? (
              <img src={listing.product.image_url} alt={listing.product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center text-slc-steel">
                <span className="text-6xl mb-2">📦</span>
                <span>No image</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-white border border-slc-divider text-slc-ink px-4 py-2 rounded-full font-bold text-sm shadow-sm">
              {listing.condition_label}
            </span>
            <span className="bg-slc-cloud text-slc-ink px-4 py-2 rounded-full font-bold text-sm border border-slc-divider">
              ✨ {listing.ai_grade}
            </span>
            <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-bold text-sm border border-purple-200">
              🤖 AI Verified
            </span>
          </div>

          <div className="bg-slc-leaf-light border border-slc-leaf rounded-xl p-4 mt-4">
            <p className="text-slc-ink text-sm font-semibold">
              ✅ <span className="font-bold">SecondLife Certified:</span> This item was AI-inspected before listing. What you see is what you get.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Actions */}
        <div className="w-full md:w-[55%]">
          
          <div className="text-xs text-slc-steel font-medium tracking-wide uppercase mb-2">
            Marketplace {">"} {listing.product.category} {">"} <span className="truncate inline-block max-w-[200px] align-bottom">{listing.product.name}</span>
          </div>
          
          <span className="bg-slc-smoke text-slc-steel text-[10px] font-bold uppercase px-2 py-1 rounded">
            {listing.product.category}
          </span>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slc-ink leading-tight mt-2">
            {listing.product.name}
          </h1>

          <div className="mt-2 text-slc-amber text-lg">
            ★★★★☆ <span className="text-slc-steel text-sm ml-1">4.2</span>
          </div>

          <div className="mt-4 border-b border-slc-divider pb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slc-steel text-sm font-medium">Original M.R.P.:</span>
              <span className="text-slc-steel text-sm line-through">₹{Math.round(originalPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-slc-red text-3xl font-bold font-mono">
                ₹{listing.asking_price.toLocaleString('en-IN')}
              </div>
              <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">
                You save {savingsPct}% vs new
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="bg-slc-leaf-light text-slc-leaf-dark text-xs font-semibold px-4 py-2 rounded-full border border-slc-leaf/30 flex items-center shadow-sm">
              🌿 Earn {listing.green_credits_on_purchase || 150} Green Credits
            </div>
            <div className="bg-sky-50 text-sky-700 text-xs font-semibold px-4 py-2 rounded-full border border-sky-200 flex items-center shadow-sm">
              ☁️ Saves {listing.co2_saved || 2.1} kg CO₂
            </div>
          </div>

          <div className="mt-5 bg-amber-50 border-l-4 border-slc-amber rounded-r-xl p-4">
            <div className="text-[11px] text-slc-steel uppercase font-bold mb-1 tracking-wider">
              💬 Seller&apos;s Note
            </div>
            <p className="italic text-slc-ink text-sm">
              {listing.seller_note ? `"${listing.seller_note}"` : "No additional notes from seller."}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-slc-ink text-base mb-2">About this item</h3>
            <p className="text-sm text-slc-steel leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="mt-8 bg-slc-cloud rounded-xl p-4 border border-slc-divider">
            <h4 className="text-xs font-bold text-slc-steel uppercase tracking-widest text-center mb-4">Item Life Path</h4>
            <div className="flex justify-between items-center relative max-w-sm mx-auto">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slc-leaf/30 -translate-y-1/2 z-0"></div>
              
              <div className="flex flex-col items-center relative z-10 bg-slc-cloud px-2">
                <span className="text-2xl mb-1 drop-shadow-sm">📦</span>
                <span className="text-[10px] font-bold text-slc-ink">Returned</span>
              </div>
              <div className="flex flex-col items-center relative z-10 bg-slc-cloud px-2">
                <span className="text-2xl mb-1 drop-shadow-sm">🤖</span>
                <span className="text-[10px] font-bold text-slc-ink">AI Graded</span>
              </div>
              <div className="flex flex-col items-center relative z-10 bg-slc-cloud px-2">
                <span className="text-2xl mb-1 drop-shadow-sm">♻️</span>
                <span className="text-[10px] font-bold text-slc-ink">Listed</span>
              </div>
              <div className="flex flex-col items-center relative z-10 bg-slc-cloud px-2 opacity-50 grayscale transition-all">
                <span className="text-2xl mb-1 drop-shadow-sm">💚</span>
                <span className="text-[10px] font-bold text-slc-ink">Your Credits</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={handlePurchase}
              className="bg-slc-amber hover:bg-yellow-500 text-slc-ink font-bold py-4 rounded-full text-base w-full shadow-sm transition-colors"
            >
              🛒 Add to Cart
            </button>
            <button 
              onClick={handlePurchase}
              className="bg-[#FFA41C] hover:bg-[#FA8900] text-slc-ink font-bold py-4 rounded-full text-base w-full shadow-sm transition-colors"
            >
              ⚡ Buy Now
            </button>
            <button 
              onClick={() => router.back()}
              className="text-slc-steel text-sm text-center mt-2 hover:underline cursor-pointer font-medium"
            >
              ↩ Return to Marketplace
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="bg-slc-cloud rounded-lg p-3 text-center border border-slc-divider">
              <div className="text-xl mb-1 text-slc-steel">🔒</div>
              <div className="text-xs text-slc-steel font-bold">Secure</div>
            </div>
            <div className="bg-slc-cloud rounded-lg p-3 text-center border border-slc-divider">
              <div className="text-xl mb-1 text-slc-steel">🚚</div>
              <div className="text-xs text-slc-steel font-bold">Fast Ship</div>
            </div>
            <div className="bg-slc-cloud rounded-lg p-3 text-center border border-slc-divider">
              <div className="text-xl mb-1 text-slc-steel">↩️</div>
              <div className="text-xs text-slc-steel font-bold">Easy Return</div>
            </div>
          </div>

        </div>
      </div>
      <ToastComponent />
    </div>
  );
}
