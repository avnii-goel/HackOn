"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Bot, Heart, Footprints, Baby, Package, Check, X, Pause, Search, Trophy, Leaf, CheckCircle, ShieldCheck, Recycle, DollarSign, Star, RefreshCw } from 'lucide-react';
import ProductCard from "@/components/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  return_rate: number;
  refurb_price?: number | null;
}

const fallbackProducts: Product[] = [
  { id: "49a5bb33-491a-40fd-8bf8-3c7ae1742ba8", name: "Sony WH-1000XM5 Headphones", category: "electronics", price: 29990, image_url: null, return_rate: 18, refurb_price: 21990 },
  { id: "845b773e-9cd6-44c4-8228-cf68fc9db0e0", name: "Nike Air Max Running Shoes", category: "clothing", price: 8995, image_url: null, return_rate: 34, refurb_price: 5995 },
  { id: "38a3d713-1025-4c44-96a0-714c9b6f7e98", name: "Apple iPad 10th Gen", category: "electronics", price: 44900, image_url: null, return_rate: 12, refurb_price: 32900 },
  { id: "d3ed85f7-d2ff-4a7f-800d-7dca16c5534b", name: "Prestige Pressure Cooker 5L", category: "home", price: 2499, image_url: null, return_rate: 8 },
  { id: "f1a45e60-5279-414c-906b-2462b8298036", name: "Atomic Habits Book", category: "books", price: 399, image_url: null, return_rate: 5 },
  { id: "f0ca88ae-487a-45fd-9e09-e14b6364a4e5", name: "Nivia Football Size 5", category: "sports", price: 1299, image_url: null, return_rate: 15, refurb_price: 799 },
];

const CATEGORY_FILTERS = ["All", "Electronics", "Clothing", "Home", "Books", "Sports", "Eco Picks"];

const PLACEHOLDER_IMAGES: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  clothing: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  home: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  books: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  sports: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

const capitalizeCategory = (cat: string) => {
  return cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getRiskLevel = (returnRate: number) => {
  if (returnRate > 20) return "High Risk";
  if (returnRate > 10) return "Medium Risk";
  return "Low Risk";
};

const FEED_ITEMS = [
  { avatar: 'P', color: 'bg-red-500', text: <>Priya in Mumbai → Resold Nike shoes → +200 <Heart className="w-3 h-3 inline text-slc-leaf fill-current" /></>, time: '2m ago' },
  { avatar: 'R', color: 'bg-blue-500', text: 'Rahul in Delhi → Baby monitor listed → 3 buyers interested', time: '5m ago' },
  { avatar: 'A', color: 'bg-purple-600', text: 'Seller #4821 → 12 returns AI-graded → ₹890 avg recovered', time: '8m ago' },
  { avatar: 'S', color: 'bg-orange-500', text: <>CO₂ saved today → 142 kg saved <Leaf className="w-3 h-3 inline text-emerald-400" /></>, time: '11m ago' },
  { avatar: 'M', color: 'bg-teal-600', text: 'Meera in Pune → iPad listed for ₹32,000 → sold in 3 hrs', time: '14m ago' },
];

function LiveFeedCard() {
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIdx((prev) => (prev + 1) % FEED_ITEMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-dark rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="live-dot" />
        <span className="text-white font-bold text-sm">Live Activity</span>
        <span className="ml-auto text-white/40 text-xs">SecondLife network</span>
      </div>

      {/* Animated feed */}
      <div className="space-y-3">
        {FEED_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 transition-all duration-500"
            style={{
              opacity: i === visibleIdx ? 1 : i === (visibleIdx + 1) % FEED_ITEMS.length ? 0.6 : i === (visibleIdx + 2) % FEED_ITEMS.length ? 0.3 : 0.1,
              transform: `translateY(${(i - visibleIdx + FEED_ITEMS.length) % FEED_ITEMS.length > 2 ? 4 : 0}px)`,
            }}
          >
            <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5`}>
              {item.avatar}
            </div>
            <div className="flex-1 glass rounded-xl px-3 py-2.5">
              <p className="text-white/90 text-sm leading-snug">{item.text}</p>
            </div>
            <span className="text-white/30 text-xs shrink-0 mt-1">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
        {[
          { val: '1.2M', label: 'Products saved' },
          { val: '840K', label: 'kg CO₂' },
          { val: '₹24Cr', label: 'Value returned' },
        ].map((stat) => (
          <div key={stat.val} className="text-center">
            <p className="text-white font-black text-lg font-mono leading-none">{stat.val}</p>
            <p className="text-white/40 text-[10px] mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/listings`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const available = data.filter((l: { is_available: boolean }) => l.is_available);
        setProducts(available);
      } catch (err) {
        console.warn("Using fallback listings on landing page");
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
  <div className="bg-slc-cloud text-slc-ink overflow-x-hidden transition-colors duration-300">

    {/* ══ HERO ══════════════════════════════════════════ */}
    <section className="gradient-hero relative min-h-[620px] flex items-center overflow-hidden">
      
      {/* Ambient orbs */}
      <div className="orb w-96 h-96 bg-slc-leaf/20 top-[-80px] left-[-60px]" />
      <div className="orb w-80 h-80 bg-slc-amber/10 bottom-[-40px] right-[10%]" style={{animationDelay: '4s'}} />
      <div className="orb w-64 h-64 bg-slc-leaf/10 top-[30%] right-[25%]" style={{animationDelay: '8s'}} />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center py-20">
        
        {/* Left — Copy */}
        <div>
          {/* Eyebrow */}
          <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-slc-amber text-xs font-bold tracking-widest uppercase">🏆 Amazon Hackathon 6.0</span>
          </div>

          <h1 className="animate-fade-in-up stagger-2 text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Returns don&apos;t<br />
            have to be{' '}
            <span className="text-gradient">wasted.</span>
          </h1>

          <p className="animate-fade-in-up stagger-3 text-white/70 text-lg leading-relaxed mb-8 max-w-md">
            AI grades your item in 2 seconds. Finds it a new owner. You earn Green Credits. The planet wins.
          </p>

          {/* Proof points */}
          <div className="animate-fade-in-up stagger-4 flex flex-col gap-2 mb-10">
            {[
              '✓  1.2M products rescued from landfill',
              '✓  ₹24 crore returned to customers',
              '✓  840K kg CO₂ prevented'
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-3 flex-wrap">
            <button
              onClick={() => router.push('/sell')}
              className="shimmer-btn relative overflow-hidden bg-gradient-to-r from-slc-amber via-yellow-400 to-slc-amber text-slc-ink font-bold px-8 py-4 rounded-xl text-base hover:scale-[1.03] active:scale-[0.97] transition-transform flex items-center gap-2 justify-center"
            >
              <Camera className="w-5 h-5" /> Sell My Used Item →
            </button>
            <button
              onClick={() => router.push('/return/49a5bb33-491a-40fd-8bf8-3c7ae1742ba8')}
              className="glass text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/15 transition-colors border border-white/20 flex items-center gap-2 justify-center"
            >
              <RefreshCw className="w-5 h-5" /> Return a Purchase
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="glass text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/15 transition-colors border border-white/20"
            >
              Browse Marketplace
            </button>
          </div>
        </div>

        {/* Right — Live Activity Feed */}
        <div className="animate-fade-in-up stagger-3">
          <LiveFeedCard />
        </div>
      </div>
    </section>

    {/* ══ HOW IT WORKS ══════════════════════════════════ */}
    <section className="bg-white py-20 relative overflow-hidden">
      {/* Top edge fade from hero */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a1210]/8 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="text-slc-leaf text-xs font-bold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-4xl font-extrabold text-slc-ink tracking-tight">
            From return to reward —{' '}
            <span className="text-gradient">in 3 minutes.</span>
          </h2>
          <p className="text-slc-steel mt-3 text-base max-w-md mx-auto">
            No warehouse visits. No strangers at your door. Just AI doing the heavy lifting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-slc-leaf/30 via-slc-amber/40 to-slc-leaf/30" />

          {[
            {
              num: '01', icon: <Camera className="w-6 h-6 text-slc-leaf" />, color: 'bg-slc-leaf-light border-slc-leaf/20',
              iconBg: 'bg-slc-leaf text-white',
              title: 'Upload photos',
              body: 'Snap 2–3 photos. Our AI reads surface condition, wear patterns, and functionality in under 2 seconds.',
              cta: 'Try it now →', href: '/product/1'
            },
            {
              num: '02', icon: <Bot className="w-6 h-6 text-slc-amber" />, color: 'bg-slc-amber-light border-slc-amber/20',
              iconBg: 'bg-slc-amber text-slc-ink',
              title: 'AI decides the best path',
              body: 'Resell, Refurbish, Donate, or Recycle — the system picks what maximises value for everyone involved.',
              cta: null, href: null
            },
            {
              num: '03', icon: <Heart className="w-6 h-6 text-slc-leaf fill-current" />, color: 'bg-slc-leaf-light border-slc-leaf/20',
              iconBg: 'bg-slc-leaf text-white',
              title: 'Earn Green Credits',
              body: 'Credits hit your wallet instantly. Spend them in the marketplace or unlock sustainability badges.',
              cta: 'See rewards →', href: '/dashboard'
            }
          ].map((step, i) => (
            <div key={step.num}
              className={`card-3d relative bg-white rounded-2xl border ${step.color} p-7 shadow-sm`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center text-xl font-bold shadow-sm shrink-0`}>
                  {step.icon}
                </div>
                <span className="text-slc-divider font-black text-4xl leading-none mt-1 select-none">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-slc-ink mb-2">{step.title}</h3>
              <p className="text-slc-steel text-sm leading-relaxed">{step.body}</p>
              {step.cta && (
                <button
                  onClick={() => router.push(step.href!)}
                  className="mt-4 text-slc-leaf text-sm font-bold hover:underline"
                >
                  {step.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ STORY CARDS (Priya / Rahul / Seller) ════════ */}
    <section className="gradient-section py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="text-slc-leaf text-xs font-bold tracking-widest uppercase mb-3">Real impact</p>
          <h2 className="text-4xl font-extrabold text-slc-ink tracking-tight">
            Three people. One broken system.{' '}
            <span className="text-gradient">One fix.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              avatar: 'P', avatarBg: 'bg-red-500', name: 'Priya, Chennai',
              item: 'Nike Shoes — ₹500',
              accentBorder: 'border-l-4 border-red-400',
              accentBg: 'bg-red-50',
              problem: 'Returned shoes travelled 600km back to warehouse. Cost to relist exceeded item value. Written off.',
              badgeOld: { color: 'bg-red-100 text-red-700', text: 'Old: Item liquidated at a loss' },
              win: 'SecondLife: AI graded in 2s → Listed locally → Sold in 4 hrs → Priya earned ₹180 + 200 pts',
              winBg: 'bg-slc-leaf-light border border-slc-leaf/30'
            },
            {
              avatar: 'R', avatarBg: 'bg-blue-500', name: 'Rahul, Delhi',
              item: 'Baby Monitor',
              accentBorder: 'border-l-4 border-blue-400',
              accentBg: 'bg-blue-50',
              problem: "Works perfectly. Won't list on classifieds — strangers, haggling, doorstep risk. Sitting in a drawer.",
              badgeOld: { color: 'bg-blue-100 text-blue-700', text: 'Old: Gathering dust in drawer' },
              win: 'Listed on SecondLife → 3 verified nearby parents notified → Sold safely → +150 pts',
              winBg: 'bg-slc-leaf-light border border-slc-leaf/30'
            },
            {
              avatar: 'S', avatarBg: 'bg-purple-600', name: 'Seller, Jaipur',
              item: '200 returns/month',
              accentBorder: 'border-l-4 border-purple-400',
              accentBg: 'bg-purple-50',
              problem: "All marked 'didn't match'. All fine. Manually inspects, guesses price, re-photographs on phone.",
              badgeOld: { color: 'bg-purple-100 text-purple-700', text: '😓 Old: 40 hrs/month manual work' },
              win: 'AI bulk-grades all 200 → Auto-priced → Auto-listed → ₹1.4L recovered this month',
              winBg: 'bg-slc-leaf-light border border-slc-leaf/30'
            }
          ].map((story) => (
            <div key={story.name}
              className={`card-3d-subtle bg-white rounded-2xl border border-slc-divider overflow-hidden shadow-sm transition-all`}
            >
              <div className={`${story.accentBg} ${story.accentBorder} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${story.avatarBg} flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                    {story.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slc-ink text-sm">{story.name}</p>
                    <p className="text-slc-steel text-xs">{story.item}</p>
                  </div>
                </div>
                <p className="text-slc-steel text-sm italic leading-relaxed">&quot;{story.problem}&quot;</p>
                <span className={`inline-block mt-4 text-xs font-bold px-3 py-1.5 rounded-full ${story.badgeOld.color}`}>
                  {story.badgeOld.text}
                </span>
              </div>
              <div className={`${story.winBg} p-5 m-4 rounded-xl`}>
                <p className="text-slc-leaf text-sm font-semibold leading-relaxed">{story.win}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ PRODUCT CATALOG ═══════════════════════════════ */}
    <section className="bg-[#F0F2F2] py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <p className="text-slc-leaf text-xs font-bold tracking-widest uppercase mb-2">Catalog</p>
            <h2 className="text-3xl font-extrabold text-slc-ink tracking-tight">
              Shop SecondLife Listings
            </h2>
            <p className="text-slc-steel text-sm mt-1">Verified quality. AI-graded. Real savings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all ${
                  activeCategory === cat
                    ? 'bg-slc-leaf text-white shadow-md shadow-slc-leaf/20 scale-105'
                    : 'bg-white border border-slc-divider text-slc-steel hover:border-slc-leaf hover:text-slc-leaf'
                }`}
              >
                {cat === 'All' ? 'All' : capitalizeCategory(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slc-divider">
                <div className="aspect-[4/3] bg-slc-smoke animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slc-smoke animate-pulse rounded w-1/3" />
                  <div className="h-6 bg-slc-smoke animate-pulse rounded" />
                  <div className="h-4 bg-slc-smoke animate-pulse rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((listing: any, idx) => {
              const productShape = {
                id: listing.product_id || listing.id,
                listing_id: listing.id,
                name: listing.product?.name || listing.product_name || listing.name,
                category: listing.product?.category || listing.category,
                image_url: listing.product?.image_url || listing.image_url,
                asking_price: listing.asking_price || listing.price,
                condition_label: listing.condition_label,
                ai_grade: listing.ai_grade,
                description: listing.description,
                return_rate: listing.return_rate || 0,
                price: listing.price || listing.original_price || listing.asking_price,
                refurb_price: listing.refurb_price || listing.asking_price
              };
              
              return (
                <div key={listing.id} className="relative group">
                  {/* Left accent on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-slc-leaf to-slc-leaf-dark opacity-0 group-hover:opacity-100 transition-opacity z-0 rounded-2xl blur-sm" />
                  <div className="relative z-10 h-full">
                    <ProductCard
                      product={productShape}
                      isMarketplace={true}
                      onClick={() => router.push(`/product/${listing.id}`)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slc-divider">
            <Search className="w-12 h-12 text-slc-steel mx-auto mb-4" />
            <h3 className="text-xl font-bold">No products in this category</h3>
            <p className="text-slc-steel mt-2">Try a different filter.</p>
          </div>
        )}
      </div>
    </section>

    {/* ══ SELLER CTA SECTION ══════════════════════════════ */}
    <section className="bg-slc-bark py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background orb */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-slc-leaf/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left */}
          <div>
            <span className="bg-slc-amber/20 text-slc-amber text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              For Sellers
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 leading-tight">
              200 returns a month.<br />
              <span className="text-gradient">Zero manual work.</span>
            </h2>
            <p className="text-white/60 text-base mt-4 leading-relaxed max-w-md">
              SecondLife AI bulk-grades your entire return queue in seconds. 
              Auto-prices. Auto-lists. You just watch the recovery numbers climb.
            </p>
            <div className="flex flex-col gap-3 mt-6 max-w-xs">
              {[
                "✓  AI grades every return automatically",
                "✓  Personalised insights for your store type",
                "✓  ₹1.4L recovered by one seller last month",
              ].map(point => (
                <p key={point} className="text-white/80 text-sm font-medium">{point}</p>
              ))}
            </div>
            <button
              onClick={() => router.push('/seller')}
              className="mt-8 bg-slc-amber hover:bg-yellow-500 text-slc-ink font-bold px-8 py-4 rounded-xl text-base transition-colors glow-amber"
            >
              Open Seller Intelligence Hub →
            </button>
          </div>

          {/* Right — mini stat preview */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4">
              This month's seller snapshot
            </p>
            {[
              { label: "Returns auto-graded", val: "212", icon: <Bot className="w-5 h-5 text-slc-leaf" />, color: "text-slc-leaf" },
              { label: "Value recovered", val: "₹1,41,480", icon: <DollarSign className="w-5 h-5 text-slc-amber" />, color: "text-slc-amber" },
              { label: "Manual inspections done", val: "0", icon: <CheckCircle className="w-5 h-5 text-white" />, color: "text-white" },
              { label: "CO₂ prevented", val: "18.4 kg", icon: <Leaf className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">{stat.icon}</div>
                  <span className="text-white/70 text-sm font-medium">{stat.label}</span>
                </div>
                <span className={`font-black font-mono text-lg ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ══ GRADING SECTION ═══════════════════════════════ */}
    <section className="bg-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #067D62 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80"
            alt="AI quality control lab"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slc-ink/70 via-slc-ink/20 to-transparent flex flex-col justify-end p-7">
            <div className="glass rounded-2xl p-4">
              <p className="text-white font-bold text-lg">Certified Quality Control</p>
              <p className="text-white/80 text-sm mt-1">LLaMA 4 Vision — every item inspected before listing.</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-slc-leaf text-xs font-bold tracking-widest uppercase mb-3">AI grading</p>
          <h2 className="text-3xl font-extrabold text-slc-ink tracking-tight mb-8">How we grade items</h2>
          <div className="space-y-5">
            {[
              { icon: <Star className="w-6 h-6 text-slc-amber" />, bg: 'bg-slc-amber-light', iconC: 'text-slc-amber', title: 'Pristine', body: 'Indistinguishable from new. Often original factory seal or zero sign of wear.' },
              { icon: <CheckCircle className="w-6 h-6 text-slc-leaf" />, bg: 'bg-slc-leaf-light', iconC: 'text-slc-leaf', title: 'Refurbished', body: 'Professionally restored to full functionality by certified technicians.' },
              { icon: <Leaf className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', iconC: 'text-blue-600', title: 'Pre-Loved', body: 'Minor cosmetic wear, fully functional. Most sustainable choice for your wallet.' },
            ].map((grade) => (
              <div key={grade.title}
                className="card-3d-subtle flex items-start gap-4 bg-[#F0F2F2] rounded-2xl p-5 border border-slc-divider hover:border-slc-leaf/30 transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl ${grade.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                  {grade.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slc-ink text-base">{grade.title}</h4>
                  <p className="text-slc-steel text-sm mt-1 leading-relaxed">{grade.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ══ TRUST BAR ═════════════════════════════════════ */}
    <section className="bg-slc-bark py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: <Bot className="w-6 h-6 text-white" />, title: 'AI-graded in 2 seconds', sub: 'LLaMA 4 Vision — not guesswork' },
          { icon: <ShieldCheck className="w-6 h-6 text-white" />, title: 'Amazon-trusted payments', sub: 'Same checkout you already know' },
          { icon: <Leaf className="w-6 h-6 text-white" />, title: 'Carbon impact tracked', sub: 'Every kg CO₂ saved, shown to you' },
          { icon: <Recycle className="w-6 h-6 text-white" />, title: 'Nothing goes to landfill', sub: 'Donate, recycle, resell — always' },
        ].map((trust) => (
          <div key={trust.title} className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-2xl shrink-0">
              {trust.icon}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{trust.title}</p>
              <p className="text-white/55 text-xs mt-0.5">{trust.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ══ FOOTER ════════════════════════════════════════ */}
    <footer className="bg-slc-bark border-t border-white/10 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="max-w-xs">
          <div className="text-white font-black text-xl mb-1 flex items-center gap-2">
            <Leaf className="w-4 h-4 inline mr-1 text-slc-leaf" /> SecondLife
          </div>
          <div className="text-slc-amber text-[10px] font-bold tracking-widest uppercase mb-3">by Amazon</div>
          <p className="text-white/40 text-xs leading-relaxed">
            Circular economy for a greener planet. Every return gets a second life.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">About</p>
            <a href="#" className="block text-white/70 text-sm hover:text-white transition-colors mb-2">Sustainability Report</a>
            <a href="#" className="block text-white/70 text-sm hover:text-white transition-colors">How it works</a>
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">Support</p>
            <a href="#" className="block text-white/70 text-sm hover:text-white transition-colors mb-2">Help Center</a>
            <a href="#" className="block text-white/70 text-sm hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);
}
