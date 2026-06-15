"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Laptop, Shirt, Home, Book, Activity, Store, Camera, Battery, Package, Ruler, Palette, Wrench, Building, Heart, GraduationCap, Dumbbell, Handshake, Bot, BarChart, DollarSign, TrendingDown, Lightbulb, Target } from 'lucide-react';
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STORE_TYPES = [
  { id: "electronics", emoji: <Laptop className="w-8 h-8 text-blue-500 mb-3" />, iconSmall: <Laptop className="w-4 h-4" />, label: "Electronics Store", description: "Mobiles, laptops, audio, accessories", topReturn: "Connectivity issues (34%)", aiSpeciality: "Component testing + refurb routing", avgRecovery: "₹12,400", color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600" },
  { id: "clothing", emoji: <Shirt className="w-8 h-8 text-pink-500 mb-3" />, iconSmall: <Shirt className="w-4 h-4" />, label: "Fashion & Apparel", description: "Clothing, shoes, accessories", topReturn: "Size mismatch (61%)", aiSpeciality: "Fit analysis + peer resale routing", avgRecovery: "₹2,800", color: "border-pink-200 hover:border-pink-400 hover:bg-pink-50 text-pink-600" },
  { id: "home", emoji: <Home className="w-8 h-8 text-orange-500 mb-3" />, iconSmall: <Home className="w-4 h-4" />, label: "Home & Kitchen", description: "Appliances, furniture, cookware", topReturn: "Wrong size delivered (44%)", aiSpeciality: "Functional testing + local resale", avgRecovery: "₹4,100", color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600" },
  { id: "books", emoji: <Book className="w-8 h-8 text-amber-500 mb-3" />, iconSmall: <Book className="w-4 h-4" />, label: "Books & Stationery", description: "Books, notebooks, educational material", topReturn: "Damaged pages / wrong edition", aiSpeciality: "Condition scan + NGO donation routing", avgRecovery: "₹280", color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-600" },
  { id: "sports", emoji: <Activity className="w-8 h-8 text-green-500 mb-3" />, iconSmall: <Activity className="w-4 h-4" />, label: "Sports & Fitness", description: "Equipment, gear, activewear", topReturn: "Size smaller than expected (52%)", aiSpeciality: "Wear assessment + resale grading", avgRecovery: "₹1,900", color: "border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600" },
  { id: "multi", emoji: <Store className="w-8 h-8 text-purple-500 mb-3" />, iconSmall: <Store className="w-4 h-4" />, label: "Multi-Category Store", description: "Mixed inventory across categories", topReturn: "Varies by category", aiSpeciality: "Full-spectrum AI routing", avgRecovery: "₹6,200", color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600" },
];

const MONTHLY_RECOVERY_BASE = [
  { month: "Jan", value: 38000 },
  { month: "Feb", value: 52000 },
  { month: "Mar", value: 61000 },
  { month: "Apr", value: 74000 },
  { month: "May", value: 89000 },
  { month: "Jun", value: 114000 },
];

const ROUTING = {
  electronics: { resell: 72, refurbish: 18, donate: 0, recycle: 10 },
  clothing: { resell: 61, refurbish: 0, donate: 28, recycle: 11 },
  home: { resell: 55, refurbish: 30, donate: 15, recycle: 0 },
  books: { resell: 40, refurbish: 0, donate: 45, recycle: 15 },
  sports: { resell: 68, refurbish: 22, donate: 10, recycle: 0 },
  multi: { resell: 60, refurbish: 18, donate: 14, recycle: 8 },
};

const INSIGHT_RECS: Record<string, {icon:any, title:string, body:string, cta:string}[]> = {
  electronics: [
    { icon:<Camera className="text-blue-500 w-8 h-8" />, title:"Add 360° photos", body:"Listings with multi-angle photos see 31% fewer 'not as described' returns.", cta:"Update listings" },
    { icon:<Battery className="text-blue-500 w-8 h-8" />, title:"Battery health disclosure", body:"Disclosing battery % reduces return disputes by 44% for used electronics.", cta:"Add to template" },
    { icon:<Package className="text-blue-500 w-8 h-8" />, title:"Bundle accessories", body:"7 of your listings are missing accessory details. Completing them adds ₹800 avg to resale price.", cta:"View listings" }
  ],
  clothing: [
    { icon:<Ruler className="text-pink-500 w-8 h-8" />, title:"Add size guide", body:"61% of your returns are size-related. A size chart reduces this by up to 40%.", cta:"Add size guide" },
    { icon:<Palette className="text-pink-500 w-8 h-8" />, title:"Calibrate product colours", body:"'Colour not as shown' is your #2 reason. Shoot in natural light to cut this by 28%.", cta:"Learn how" }
  ],
  home: [
    { icon:<Ruler className="text-orange-500 w-8 h-8" />, title:"Verify dimensions", body:"44% wrong-size returns means your listings may have incorrect specs. AI will auto-check.", cta:"Run audit" },
    { icon:<Wrench className="text-orange-500 w-8 h-8" />, title:"Refurb partner nearby", body:"SecondLife has 2 certified refurb centres within 12km. Route eligible items for ₹400 recovery uplift.", cta:"Connect" },
    { icon:<Building className="text-orange-500 w-8 h-8" />, title:"Local resale network", body:"3 buyers within 5km are looking for home items matching your return stock.", cta:"View buyers" }
  ],
  books: [
    { icon:<Heart className="text-amber-500 w-8 h-8" />, title:"NGO donation routing", body:"45% of your returns qualify for NGO donation. You get a tax receipt + 100 green credits per batch.", cta:"Enable routing" },
    { icon:<GraduationCap className="text-amber-500 w-8 h-8" />, title:"Student resale pool", body:"8 educational titles in your returns match active student wishlists nearby.", cta:"View matches" },
    { icon:<Package className="text-amber-500 w-8 h-8" />, title:"Bundle older editions", body:"Group older editions into ₹299 study packs. Last seller cleared 23 books in 48hrs.", cta:"Create bundle" }
  ],
  sports: [
    { icon:<Ruler className="text-green-500 w-8 h-8" />, title:"Sizing chart template", body:"AI generates a sport-specific size guide for each listing. Cuts size returns by 28%.", cta:"Generate" },
    { icon:<Dumbbell className="text-green-500 w-8 h-8" />, title:"Usage declaration", body:"Buyers trust 'used 3x/week for 3 months' more than 'good condition'. AI auto-generates this.", cta:"Enable" },
    { icon:<Handshake className="text-green-500 w-8 h-8" />, title:"Sports club resale", body:"SecondLife has 4 partner sports clubs nearby buying second-hand gear in bulk.", cta:"Connect" }
  ],
  multi: [
    { icon:<Bot className="text-purple-500 w-8 h-8" />, title:"Full AI handoff", body:"Enable 'auto-grade on arrival' — every return is photographed, graded, and listed without you touching it.", cta:"Enable" },
    { icon:<BarChart className="text-purple-500 w-8 h-8" />, title:"Weekly digest", body:"Get a Monday morning summary of all returns, gradings, listings and credits earned.", cta:"Subscribe" },
    { icon:<DollarSign className="text-purple-500 w-8 h-8" />, title:"Bulk pricing rules", body:"Set category-level pricing rules. AI prices within your bands automatically.", cta:"Set rules" }
  ]
};

const INSIGHTS = {
  electronics: "AI routes 72% of these to certified refurbishment. Average recovery: ₹8,200 per unit.",
  clothing: "AI flags size-related listings for auto size-chart generation. Reduces returns by 40%.",
  home: "AI cross-references delivery dimensions vs listing specs. Catching 91% of size errors before dispatch.",
  books: "AI routes damaged books to 3 NGO partners. 45% of your book returns now become donations.",
  sports: "AI checks sizing charts at listing time. Size return rate dropped 28% for sellers using this.",
  multi: "AI segments returns by category and applies category-specific routing automatically."
};

const STATS_MAP = {
  electronics: { returns: 84, recovered: "12,400", autoGraded: "100%", co2: 6.2 },
  clothing: { returns: 67, recovered: "2,800", autoGraded: "100%", co2: 3.1 },
  home: { returns: 31, recovered: "4,100", autoGraded: "100%", co2: 4.4 },
  books: { returns: 12, recovered: "280", autoGraded: "100%", co2: 0.8 },
  sports: { returns: 18, recovered: "1,900", autoGraded: "100%", co2: 2.1 },
  multi: { returns: 212, recovered: "1,41,480", autoGraded: "100%", co2: 18.4 }
};

const MULTIPLIERS = {
  electronics: 1.0,
  clothing: 0.3,
  home: 0.4,
  books: 0.05,
  sports: 0.2,
  multi: 1.0
};

const fallbackListings = [
  { id: "201", product_name: "Samsung Galaxy S23 Ultra", category: "electronics", asking_price: 62000, condition_label: "Like New", is_available: true, image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80" },
  { id: "202", product_name: "Apple MacBook Air M2 13\"", category: "electronics", asking_price: 78000, condition_label: "Good", is_available: true, image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80" },
  { id: "204", product_name: "Levi's 511 Slim Fit Jeans — W32 L30", category: "clothing", asking_price: 1800, condition_label: "Like New", is_available: true, image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" },
  { id: "207", product_name: "Dyson V12 Detect Slim Vacuum", category: "home", asking_price: 22000, condition_label: "Good", is_available: false, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { id: "210", product_name: "The Psychology of Money", category: "books", asking_price: 180, condition_label: "Good", is_available: true, image_url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80" },
  { id: "213", product_name: "Yonex Arcsaber 11 Racket", category: "sports", asking_price: 3800, condition_label: "Good", is_available: true, image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80" },
];

export default function SellerPage() {
  const [storeType, setStoreType] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [animateBars, setAnimateBars] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("slc_store_type");
    if (saved) setStoreType(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (storeType) {
      setAnimateBars(false);
      setTimeout(() => setAnimateBars(true), 100);

      const fetchListings = async () => {
        try {
          const res = await fetch(`${API_URL}/marketplace/listings`);
          if (res.ok) {
            let data = await res.json();
            if (storeType !== "multi") {
              data = data.filter((l: any) => l.category?.toLowerCase().includes(storeType) || l.product?.category?.toLowerCase().includes(storeType));
            }
            if (data.length === 0) {
              const fallbacks = storeType === "multi" ? fallbackListings : fallbackListings.filter(l => l.category.includes(storeType));
              setListings(fallbacks.slice(0, 6));
            } else {
              setListings(data.slice(0, 6));
            }
          } else {
            throw new Error("API failed");
          }
        } catch {
          const fallbacks = storeType === "multi" ? fallbackListings : fallbackListings.filter(l => l.category.includes(storeType));
          setListings(fallbacks.slice(0, 6));
        }
      };
      fetchListings();
    }
  }, [storeType]);

  const handleSelectStore = (id: string) => {
    localStorage.setItem("slc_store_type", id);
    setStoreType(id);
  };

  const handleReset = () => {
    localStorage.removeItem("slc_store_type");
    setStoreType(null);
  };

  if (loading) return null;

  if (!storeType) {
    return (
      <div className="bg-slc-cloud min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold text-slc-ink">What kind of seller are you?</h1>
          <p className="text-slc-steel text-base mt-2 mb-10">SecondLife personalises your intelligence hub based on your store type.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {STORE_TYPES.map(s => (
              <div 
                key={s.id} 
                onClick={() => handleSelectStore(s.id)}
                className={`bg-white rounded-2xl p-6 border-2 border-transparent hover:${s.color} cursor-pointer transition-all shadow-sm hover:shadow-md group flex flex-col items-center text-center`}
              >
                <div className={`mb-4 flex justify-center ${s.color.split(' ')[0].replace('border', 'text')}`}>{s.emoji}</div>
                <h3 className="font-bold text-slc-ink text-lg mb-1">{s.label}</h3>
                <p className="text-xs text-slc-steel mt-1 mb-3 line-clamp-2 min-h-[32px]">{s.description}</p>
                <div className="border-t border-slc-divider my-3"></div>
                <div className="mt-4 pt-4 border-t border-slc-divider space-y-2">
                  <p className="text-xs text-slc-steel line-clamp-1 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /><span className="font-bold">Top return:</span> {s.topReturn}</p>
                  <p className="text-xs text-slc-steel line-clamp-1 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /><span className="font-bold">AI does:</span> {s.aiSpeciality}</p>
                  <p className="text-xs font-semibold text-slc-leaf line-clamp-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slc-steel" /><span className="font-bold text-slc-steel">Avg recovery:</span> {s.avgRecovery}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <span className="text-slc-steel text-sm">Already set up? </span>
            <button onClick={() => handleSelectStore('multi')} className="text-slc-leaf underline font-semibold text-sm">
              Skip to dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STATE B: DASHBOARD
  const storeData = STORE_TYPES.find(s => s.id === storeType)!;
  const stats = STATS_MAP[storeType as keyof typeof STATS_MAP];
  const multiplier = MULTIPLIERS[storeType as keyof typeof MULTIPLIERS];
  const chartData = MONTHLY_RECOVERY_BASE.map(d => ({ ...d, value: d.value * multiplier }));
  const routing = ROUTING[storeType as keyof typeof ROUTING];
  const recs = INSIGHT_RECS[storeType as keyof typeof INSIGHT_RECS];
  const insight = INSIGHTS[storeType as keyof typeof INSIGHTS];
  
  const maxChartVal = chartData[chartData.length - 1].value;

  return (
    <div className="bg-slc-cloud min-h-screen pb-24 font-sans animate-in fade-in duration-700">
      
      {/* STORE HEADER (Glass Dark Aesthetic) */}
      <div className="relative overflow-hidden bg-slc-bark text-white py-12 px-4 md:px-8 border-b border-white/10">
        {/* Background orbs */}
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-slc-leaf/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[20%] bottom-[-50%] w-64 h-64 bg-slc-amber/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
          <div>
            <div className={`bg-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-flex items-center gap-2 border border-white/20 shadow-inner ${storeData.color.split(' ')[0].replace('border-', 'text-')}`}>
              {storeData.iconSmall}
              <span className="text-white">{storeData.label}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Your Seller Intelligence
            </h1>
            <p className="text-white/60 text-sm mt-2 font-medium">AI-powered insights tailored for your inventory</p>
          </div>
          <button onClick={handleReset} className="glass rounded-xl px-5 py-2.5 text-white text-xs font-bold shadow-lg hover:bg-white/20 transition-all border border-white/20 active:scale-95">
            Switch Store Type
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: stats.returns, label: "Returns Auto-Graded", color: "text-white" },
            { val: `₹${stats.recovered}`, label: "Value Recovered", color: "text-slc-amber" },
            { val: stats.autoGraded, label: "AI Processing", color: "text-slc-leaf" },
            { val: `${stats.co2} kg`, label: "CO₂ Prevented", color: "text-sky-400" },
          ].map((stat, i) => (
            <div key={i} className="glass-dark rounded-2xl p-5 border border-white/10 shadow-xl card-3d-subtle hover:-translate-y-1 transition-transform">
              <p className={`text-2xl md:text-3xl font-black font-mono leading-none ${stat.color}`}>{stat.val}</p>
              <p className="text-white/60 text-[10px] uppercase tracking-widest mt-2 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TOP INSIGHT CARD */}
        <div className="mx-4 md:mx-8 mt-10">
          <div className="relative overflow-hidden bg-gradient-to-r from-slc-amber-light to-amber-50 border border-slc-amber/30 rounded-3xl p-7 flex gap-6 items-start shadow-sm card-3d-subtle group">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slc-amber/20 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slc-amber shrink-0 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6 fill-current" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-slc-amber tracking-widest mb-1.5">Your #1 Return Driver</p>
              <p className="text-2xl font-extrabold text-slc-ink mb-2">{storeData.topReturn}</p>
              <p className="text-sm text-slc-steel font-medium leading-relaxed max-w-2xl">{insight}</p>
            </div>
          </div>
        </div>

        {/* RECOVERY CHART */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slc-divider p-8 mx-4 md:mx-8 mt-8 shadow-sm card-3d-subtle">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-extrabold text-slc-ink text-xl flex items-center gap-2"><DollarSign className="w-5 h-5 text-slc-leaf" /> Monthly Value Recovery</h2>
              <p className="text-xs text-slc-steel mt-1 font-medium tracking-wide">₹ recovered from returns via SecondLife AI</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slc-steel font-bold mb-1">Total Recovered</p>
              <p className="font-black text-slc-ink text-2xl font-mono leading-none">
                ₹{chartData.reduce((acc, d) => acc + d.value, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          <div className="flex items-end gap-4 md:gap-8 h-56 px-2">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 flex-1 relative group">
                <div 
                  className="w-full max-w-[48px] bg-gradient-to-t from-slc-leaf to-emerald-400 rounded-t-xl relative shadow-inner overflow-hidden"
                  style={{ 
                    height: animateBars ? `${(data.value / maxChartVal) * 100}%` : '0%',
                    transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${idx * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slc-ink text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                    ₹{data.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <span className="text-[10px] text-slc-steel font-bold uppercase tracking-widest">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-slc-cloud w-full mt-3" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mx-4 md:mx-8 mt-8">
          {/* AI ROUTING BREAKDOWN */}
          <div className="md:col-span-1 bg-white/80 backdrop-blur-xl rounded-3xl border border-slc-divider p-8 shadow-sm card-3d-subtle">
            <h2 className="font-extrabold text-slc-ink text-lg mb-6 leading-tight flex items-center gap-2"><Bot className="w-5 h-5 text-slc-amber" /> How AI Routed Your Returns</h2>
            
            <div className="space-y-5">
              {[
                { label: "Resell", pct: routing.resell, color: "bg-slc-leaf", textC: "text-slc-leaf-dark" },
                { label: "Refurbish", pct: routing.refurbish, color: "bg-blue-500", textC: "text-blue-700" },
                { label: "Donate", pct: routing.donate, color: "bg-purple-500", textC: "text-purple-700" },
                { label: "Recycle", pct: routing.recycle, color: "bg-gray-400", textC: "text-gray-700" },
              ].map((item, i) => item.pct > 0 && (
                <div key={item.label}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-bold text-slc-ink uppercase tracking-wide">{item.label}</span>
                    <span className={`text-sm font-black font-mono ${item.textC}`}>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slc-cloud rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: animateBars ? `${item.pct}%` : '0%', transitionDelay: `${i * 150}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI RECOMMENDATIONS */}
          <div className="md:col-span-2">
            <h2 className="font-extrabold text-slc-ink text-lg mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /> Personalised Actions for You</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recs.map((rec, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slc-divider p-6 card-3d shadow-sm flex flex-col group">
                  <div className="w-12 h-12 rounded-xl bg-slc-cloud flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    {rec.icon}
                  </div>
                  <h3 className="font-bold text-slc-ink mb-2 text-base">{rec.title}</h3>
                  <p className="text-sm text-slc-steel font-medium leading-relaxed flex-1">{rec.body}</p>
                  <button className="text-slc-leaf text-sm font-bold mt-5 group-hover:text-slc-leaf-dark transition-colors self-start inline-flex items-center gap-1">
                    {rec.cta} <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIVE LISTINGS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slc-divider p-8 mx-4 md:mx-8 mt-8 mb-16 shadow-sm card-3d-subtle">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-extrabold text-slc-ink text-xl flex items-center gap-2"><Package className="w-5 h-5 text-slc-steel" /> Your Active Listings</h2>
            <Link href="/marketplace" className="text-slc-leaf font-bold text-sm hover:underline">
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-4 border border-slc-divider hover:border-slc-leaf/40 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-slc-smoke shrink-0 border border-slc-divider relative">
                  {item.product?.image_url || item.image_url ? (
                    <Image src={item.product?.image_url || item.image_url} alt={item.product?.name || item.product_name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-50"><Package className="w-6 h-6 text-slc-steel" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-slc-ink text-sm truncate">{item.product?.name || item.product_name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-slc-red font-bold font-mono text-base">₹{(item.asking_price || item.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="bg-slc-cloud text-slc-steel text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {item.condition_label}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${item.is_available ? 'text-slc-leaf' : 'text-slc-steel'}`}>
                      {item.is_available ? <><div className="w-2 h-2 rounded-full bg-slc-leaf" /> Active</> : 'Sold'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
