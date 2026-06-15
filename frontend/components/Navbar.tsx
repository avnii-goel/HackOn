"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, Moon, Sun, Leaf, Heart } from "lucide-react";
import { useTheme } from "next-themes";

function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  return (
    <div className="h-9 bg-slc-bark border-t border-white/10 hidden md:flex items-center px-8 gap-6 overflow-x-auto shadow-sm">
      {["All Departments", "Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Eco Picks"].map((cat) => {
        const catSlug = cat.toLowerCase().replace(" ", "-");
        const isActive = activeCategory.toLowerCase() === catSlug ||
                         (catSlug === "all-departments" && !activeCategory);
        return (
          <Link
            key={cat}
            href={`/marketplace?category=${encodeURIComponent(catSlug)}`}
            className={`text-sm transition-colors whitespace-nowrap font-medium ${
              isActive ? "text-slc-amber font-bold underline underline-offset-4" : "text-white hover:text-slc-amber"
            }`}
          >
            {cat === "Eco Picks" ? (
              <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> {cat}</span>
            ) : cat}
          </Link>
        );
      })}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-white/10 text-white transition-colors ml-2"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/marketplace');
    }
  };

  useEffect(() => {
    const fetchCredits = async () => {
      const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/credits/wallet/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits_balance || 0);
        }
      } catch (err) {
        console.warn("Could not fetch credits");
      }
    };
    fetchCredits();
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        {/* Main Navbar */}
        <div className="h-14 bg-slc-bark px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white hover:text-slc-amber transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex flex-col">
              <span className="text-white font-bold text-xl leading-tight flex items-center gap-1">
                <Leaf className="w-5 h-5 text-slc-leaf" /> SecondLife
              </span>
              <span className="text-slc-amber text-[10px] font-bold tracking-wider leading-none">
                by Amazon
              </span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-slc-amber">
              <div className="bg-[#f3f3f3] hover:bg-[#dadada] text-slc-steel text-xs px-3 border-r border-slc-divider flex items-center justify-center cursor-pointer transition-colors">
                All <span className="ml-1 text-[8px]">▼</span>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SecondLife marketplace..." 
                className="flex-1 bg-white text-slc-ink px-4 outline-none font-medium text-sm"
              />
              <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-5 transition-colors flex items-center justify-center">
                <Search className="w-5 h-5 text-[#333333]" />
              </button>
            </form>
          </div>

          {/* Right Cluster */}
          <div className="flex items-center gap-2 md:gap-5">
            <Link href="/dashboard" className="hidden md:flex flex-col hover:border-white border border-transparent p-1 rounded-sm cursor-pointer">
              <span className="text-[11px] text-white/80 leading-tight">Hello, Priya</span>
              <span className="text-sm font-bold text-white leading-tight flex items-center">Account & Lists <span className="ml-1 text-[8px] text-white/60">▼</span></span>
            </Link>
            
            <ThemeToggle />
            
            <Link href="/dashboard" className="hidden md:flex flex-col hover:border-white border border-transparent p-1 rounded-sm cursor-pointer">
              <span className="text-[11px] text-white/80 leading-tight">Returns</span>
              <span className="text-sm font-bold text-white leading-tight">& Orders</span>
            </Link>

            <Link href="/dashboard" className="flex items-center gap-2 hover:border-white border border-transparent p-1 rounded-sm">
              <div className="bg-slc-leaf text-white px-2 py-1 rounded text-xs font-bold font-mono border border-slc-leaf-dark shadow-sm flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" /> {credits}
              </div>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/20 shrink-0">
                P
              </div>
            </Link>
          </div>
        </div>

        {/* Category Bar */}
        <Suspense fallback={<div className="h-9 bg-slc-bark border-t border-white/10 hidden md:flex" />}>
          <CategoryBar />
        </Suspense>
      </header>

      {/* Navbar height spacer — keeps page content below fixed header */}
      <div className="h-14 md:h-[92px]" aria-hidden="true" />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="bg-slc-bark p-6 text-white flex justify-between items-center">
              <div>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold mb-3 border-2 border-white/20">P</div>
                <h3 className="font-bold text-xl">Hello, Priya</h3>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-6 pb-4 mb-4 border-b border-slc-divider">
                <Link href="/dashboard" className="block text-lg font-bold text-slc-ink py-2 hover:text-slc-leaf" onClick={() => setMobileMenuOpen(false)}>Returns & Orders</Link>
                <Link href="/marketplace" className="block text-lg font-bold text-slc-ink py-2 hover:text-slc-leaf" onClick={() => setMobileMenuOpen(false)}>Marketplace</Link>
              </div>
              <div className="px-6">
                <h4 className="font-bold text-slc-steel mb-3 text-sm tracking-widest uppercase">Categories</h4>
                {["All Departments", "Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Eco Picks"].map((cat) => (
                  <Link 
                    key={cat} 
                    href={`/marketplace?category=${encodeURIComponent(cat.toLowerCase())}`}
                    className="block text-slc-ink py-3 font-medium border-b border-slc-divider/30 last:border-0 hover:text-slc-leaf"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
