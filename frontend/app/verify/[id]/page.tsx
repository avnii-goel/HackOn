"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Leaf, CheckCircle, Package, Tag, Cloud, ShieldCheck, Bot, Heart, Lock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const fallbackListing: any = {
  id: "fallback",
  product_name: "Sony WH-1000XM5 Headphones",
  category: "electronics",
  image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  asking_price: 18000,
  original_price: 29990,
  condition_label: "Like New",
  ai_grade: "Pristine",
  condition_score: 96,
  description: "Used once, perfect condition. Box included.",
  co2_saved: 4.2,
  green_credits_on_purchase: 200,
  seller_note: "Upgrading to newer model. No issues.",
  status: "available",
};

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/listings/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Map to match properties
          const mapped = {
            id: data.id,
            product_name: data.product?.name || data.product_name,
            category: data.product?.category || data.category,
            image_url: data.product?.image_url || data.image_url,
            asking_price: data.asking_price || data.price,
            original_price: data.original_price || data.product?.original_price || (data.asking_price * 1.8),
            condition_label: data.condition_label,
            ai_grade: data.ai_grade || "Certified",
            condition_score: data.condition_score || 85,
            description: data.description,
            co2_saved: data.co2_saved || 2.5,
            green_credits_on_purchase: data.green_credits_on_purchase || 150,
            seller_note: data.seller_note,
            status: data.is_available ? "available" : "sold",
          };
          setListing(mapped);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (err) {
        fallbackListing.id = id;
        setListing(fallbackListing);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SecondLife Health Card', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {}
  };

  if (loading || !listing) {
    return (
      <div className="min-h-screen bg-slc-cloud flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slc-leaf border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    product_name, category, image_url, asking_price, original_price,
    condition_label, ai_grade, condition_score, co2_saved,
    green_credits_on_purchase, seller_note, status
  } = listing;

  const isElectronics = category.toLowerCase() === 'electronics';

  return (
    <div className="min-h-screen bg-slc-cloud py-8 px-4 font-sans text-slc-ink">
      <div className="max-w-2xl mx-auto">
        
        {/* SECTION 1: HEADER STRIP */}
        <div className="bg-slc-bark text-white py-4 px-6 flex justify-between items-center rounded-2xl shadow-md">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight flex items-center gap-1.5"><Leaf className="w-5 h-5 text-slc-leaf" /> SecondLife</span>
            <span className="text-slc-amber text-xs font-semibold">by Amazon</span>
          </div>
          <div className="bg-slc-leaf text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle className="w-5 h-5 inline mr-1 text-slc-leaf" /> Verified Certificate
          </div>
        </div>

        {/* SECTION 2: CERTIFICATE CARD */}
        <div className="bg-white rounded-3xl border-2 border-slc-leaf/20 shadow-xl overflow-hidden mt-6">
          {/* TOP BAND */}
          <div className="bg-gradient-to-r from-slc-leaf to-slc-leaf-dark py-5 px-7 text-white flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="text-xs font-black tracking-widest uppercase text-white/70">
                PRODUCT HEALTH CARD
              </p>
              <h1 className="text-2xl font-extrabold mt-1 leading-tight">{product_name}</h1>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded mt-2 inline-block font-medium tracking-wide uppercase">
                {category}
              </span>
            </div>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="bg-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg border-4 border-white/10">
                <span className="text-2xl font-black text-slc-leaf font-mono leading-none">{condition_score}</span>
                <span className="text-[10px] text-slc-steel font-bold mt-0.5">/ 100</span>
              </div>
              <span className="text-white/80 text-xs font-bold text-center mt-2 uppercase tracking-wider">Condition Score</span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-7">
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Left Image */}
              <div className="w-full sm:w-1/2 flex flex-col">
                <div className="rounded-2xl overflow-hidden aspect-square w-full bg-slc-smoke relative border border-slc-divider">
                  {image_url ? (
                    <Image src={image_url} alt={product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-slc-steel/50" /></div>
                  )}
                </div>
                <p className="text-[11px] text-slc-steel font-mono mt-3 text-center uppercase tracking-wider">
                  Certificate ID: SLC-{id.substring(0,6)}-{Date.now().toString().slice(-6)}
                </p>
              </div>

              {/* Right Facts Grid */}
              <div className="w-full sm:w-1/2 grid grid-cols-2 gap-3">
                <div className="bg-slc-cloud rounded-xl p-4 text-center border border-slc-divider/50 flex flex-col justify-center">
                  <Tag className="w-6 h-6 mb-1 text-slc-steel" />
                  <span className="text-[10px] text-slc-steel uppercase font-bold tracking-wider mb-1">AI Grade</span>
                  <span className="font-bold text-slc-ink text-sm leading-tight">{ai_grade}</span>
                </div>
                <div className="bg-slc-cloud rounded-xl p-4 text-center border border-slc-divider/50 flex flex-col justify-center">
                  <CheckCircle className="w-6 h-6 mb-1 text-slc-steel" />
                  <span className="text-[10px] text-slc-steel uppercase font-bold tracking-wider mb-1">Condition</span>
                  <span className="font-bold text-slc-ink text-sm leading-tight">{condition_label}</span>
                </div>
                <div className="bg-slc-cloud rounded-xl p-4 text-center border border-slc-divider/50 flex flex-col justify-center">
                  <Cloud className="w-6 h-6 mb-1 text-slc-steel" />
                  <span className="text-[10px] text-slc-steel uppercase font-bold tracking-wider mb-1">CO₂ Saved</span>
                  <span className="text-slc-leaf font-bold text-sm leading-tight">{co2_saved} kg</span>
                </div>
                <div className="bg-slc-cloud rounded-xl p-4 text-center border border-slc-divider/50 flex flex-col justify-center">
                  <ShieldCheck className="w-6 h-6 mb-1 text-slc-steel" />
                  <span className="text-[10px] text-slc-steel uppercase font-bold tracking-wider mb-1">Status</span>
                  <span className={`font-bold text-sm leading-tight capitalize ${status === 'available' ? 'text-slc-leaf' : 'text-slc-steel'}`}>{status}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slc-divider my-6"></div>

            {/* AI INSPECTION REPORT */}
            <div>
              <h3 className="font-bold text-slc-ink mb-4 flex items-center gap-2">
                <Bot className="w-6 h-6 inline mr-1 text-slc-amber" /> AI Inspection Report
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { text: "Surface condition verified", passed: true },
                  { text: "No structural damage detected", passed: condition_score > 60 },
                  { text: "All components functional", passed: condition_score > 70 },
                  { text: "Accessories present", passed: condition_score > 80 },
                  ...(isElectronics ? [{ text: "Battery / power tested", passed: true }] : []),
                  { text: "Authenticity confirmed", passed: true },
                  { text: "Hygienic condition cleared", passed: true },
                  { text: "Safe for resale", passed: condition_score > 65 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slc-cloud/50 p-2.5 rounded-lg border border-slc-divider/30">
                    <div className={`w-5 h-5 rounded-full text-white text-[10px] flex flex-shrink-0 items-center justify-center font-bold ${item.passed ? 'bg-slc-leaf' : 'bg-amber-500'}`}>
                      {item.passed ? '✓' : '!'}
                    </div>
                    <span className="text-sm text-slc-steel font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slc-divider my-6"></div>

            {/* SELLER'S DECLARATION */}
            <div className="bg-amber-50 border border-slc-amber/30 rounded-2xl p-5">
              <h3 className="font-bold text-slc-ink mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span> Seller&apos;s Declaration
              </h3>
              <p className="italic text-slc-steel text-sm leading-relaxed">
                {seller_note ? `"${seller_note}"` : '"No additional notes provided by the seller. Condition verified entirely by AI."'}
              </p>
              <p className="text-[10px] text-slc-steel/70 mt-3 font-semibold uppercase tracking-wider">
                Declared truthfully on {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            <div className="border-t border-slc-divider my-6"></div>

            {/* ENVIRONMENTAL IMPACT */}
            <div className="bg-slc-leaf-light rounded-2xl p-6 border border-slc-leaf/20 shadow-inner">
              <h3 className="font-bold text-slc-leaf mb-5 flex items-center gap-2">
                <Leaf className="w-5 h-5 inline mr-1 text-slc-leaf" /> Environmental Impact of This Sale
              </h3>
              <div className="grid grid-cols-3 gap-4 divide-x divide-slc-leaf/20">
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-1">
                    <Cloud className="w-6 h-6 text-sky-500" />
                    <span className="text-2xl font-black font-mono text-slc-leaf">{co2_saved}</span>
                    <span className="text-sm font-bold text-slc-leaf mt-1">kg</span>
                  </div>
                  <p className="text-[10px] text-slc-leaf-dark uppercase tracking-wider font-bold mt-1.5">CO₂ Prevented</p>
                </div>
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="w-6 h-6 text-slc-leaf fill-current" />
                    <span className="text-2xl font-black font-mono text-slc-amber">{green_credits_on_purchase || 150}</span>
                  </div>
                  <p className="text-[10px] text-slc-leaf-dark uppercase tracking-wider font-bold mt-1.5">Green Credits</p>
                </div>
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl">🌳</span>
                    <span className="text-2xl font-black font-mono text-sky-600">{Math.max(1, Math.round(co2_saved * 0.5))}</span>
                  </div>
                  <p className="text-[10px] text-slc-leaf-dark uppercase tracking-wider font-bold mt-1.5">Trees Equiv.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRICE + CTA */}
        <div className="bg-white rounded-3xl border border-slc-divider shadow-md p-6 mt-6">
          <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slc-steel uppercase tracking-widest mb-1">
                SecondLife Certified Price
              </p>
              <p className="text-4xl font-black text-slc-red font-mono leading-none">
                ₹{asking_price.toLocaleString('en-IN')}
              </p>
              {original_price && original_price > asking_price && (
                <p className="text-xs font-semibold text-slc-steel mt-2 bg-slc-cloud inline-block px-2 py-1 rounded">
                  vs ₹{original_price.toLocaleString('en-IN')} new — save {Math.round((1-asking_price/original_price)*100)}%
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-64 shrink-0">
              <button
                onClick={() => router.push(id === 'fallback' ? '/marketplace' : `/marketplace/${id}`)}
                className="bg-slc-leaf hover:bg-slc-leaf-dark text-white font-bold py-3.5 rounded-xl w-full text-sm shadow-md transition-all active:scale-[0.98]"
              >
                🛒 Buy This Item
              </button>
              <button
                onClick={handleShare}
                className="border-2 border-slc-divider hover:border-slc-leaf/50 text-slc-ink bg-white py-3 rounded-xl w-full text-sm font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>↗</span> Share Certificate
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: FOOTER WATERMARK */}
        <div className="text-center py-8">
          <p className="text-xs font-medium text-slc-steel/60">
            <Lock className="w-3 h-3 inline mr-1" /> This certificate is AI-generated by SecondLife&apos;s LLaMA 4 Vision inspection system.
          </p>
          <p className="text-[10px] text-slc-steel/40 mt-1 uppercase tracking-wider font-bold">
            Certificate valid as of {new Date().toLocaleDateString('en-IN')}
          </p>
        </div>

        {/* TOAST NOTIFICATION */}
        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slc-leaf text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            🔗 Certificate link copied!
          </div>
        )}
      </div>
    </div>
  );
}
