"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getWallet, getLeaderboard } from "@/lib/api";

interface Transaction {
  id: string;
  user_id: string;
  action_type: string;
  credits_earned: number;
  listing_id: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  credits_balance: number;
  co2_saved_kg: number;
  created_at: string;
}

interface WalletData {
  user: User;
  credits_balance: number;
  co2_saved_kg: number;
  transaction_history: Transaction[];
  leaderboard_rank: number | null;
  total_transactions: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  credits_balance: number;
  co2_saved_kg: number;
}

function getActionIcon(actionType: string): string {
  switch (actionType) {
    case "resell_submitted":
      return "🏷️";
    case "refurb_purchased":
      return "🔧";
    case "donated":
      return "🎁";
    case "recycle_submitted":
      return "♻️";
    case "purchase":
      return "🛒";
    case "normal_return":
      return "↩️";
    default:
      return "💚";
  }
}

function getActionLabel(actionType: string): string {
  switch (actionType) {
    case "resell_submitted":
      return "Item Listed for Resell";
    case "refurb_purchased":
      return "Refurbished Purchase";
    case "donated":
      return "Item Donated";
    case "recycle_submitted":
      return "Item Recycled";
    case "purchase":
      return "Marketplace Purchase";
    case "normal_return":
      return "Standard Return";
    default:
      return actionType.replace(/_/g, " ");
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTierLabel(credits: number): { label: string; className: string } {
  if (credits >= 1000) return { label: "Legend", className: "bg-amber-100 text-amber-700" };
  if (credits >= 750) return { label: "Elite", className: "bg-slate-100 text-slate-700" };
  if (credits >= 500) return { label: "Gold", className: "bg-amber-50 text-amber-600" };
  if (credits >= 250) return { label: "Silver", className: "bg-surface-container-highest text-on-surface-variant" };
  return { label: "Bronze", className: "bg-surface-container-highest text-on-surface-variant" };
}

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatedCredits, setAnimatedCredits] = useState(0);
  const animRef = useRef<number | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("slc_user_id") || "" : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = localStorage.getItem("slc_user_id") || "";
        if (!uid) throw new Error("No user ID found. Please visit the home page first.");

        const [walletData, lbData] = await Promise.all([
          getWallet(uid),
          getLeaderboard().catch(() => []),
        ]);

        setWallet(walletData);
        setLeaderboard(lbData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Animated counter for credits
  useEffect(() => {
    if (wallet) {
      const target = wallet.credits_balance;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedCredits(Math.floor(eased * target));

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      };

      animRef.current = requestAnimationFrame(animate);
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }
  }, [wallet]);

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen">
        <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
          <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <span>🌿</span> SecondLife
            </div>
          </div>
        </nav>
        <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-surface-container animate-pulse rounded mb-2" />
          <div className="h-5 w-96 bg-surface-container animate-pulse rounded mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface-container animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-80 bg-surface-container animate-pulse rounded-xl" />
            <div className="lg:col-span-5 h-80 bg-surface-container animate-pulse rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold mb-2">Could not load dashboard</h3>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <button onClick={() => router.push("/")} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const creditsProgress = ((wallet.credits_balance % 500) / 500) * 100;
  const nextTierPoints = 500 - (wallet.credits_balance % 500);
  const co2Percent = Math.min((wallet.co2_saved_kg / 10) * 100, 100);
  const avgCo2 = 0.2;
  const avgPercent = 2;
  const co2Multiplier = wallet.co2_saved_kg > 0 ? (wallet.co2_saved_kg / avgCo2).toFixed(1) : "0";
  const gaugeOffset = 282.7 - (282.7 * co2Percent) / 100;

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div
            className="text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span>🌿</span> SecondLife
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-base text-on-surface-variant hover:text-primary transition-colors" href="/">
              Home
            </a>
            <a className="text-base text-on-surface-variant hover:text-primary transition-colors" href="/marketplace">
              Marketplace
            </a>
            <a className="text-base text-primary font-bold border-b-2 border-primary pb-1" href="#">
              Dashboard
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform">
              💚 {wallet.credits_balance} pts
            </span>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtFwZDdtRWl3ECKMqaxgbgW9tmXCdS9zd_F1QMpj22RbyUVt6BR6F0sSYzku2OaQOfFJa5ncVaVzdRFs47MNqJqDPJrkPa4U4MYKjg5JmBe7t3b8A0-Zie0OW2RCFDtFVb2QslQRvLZeYgotN4oIMjRjVSjeYWlZ9IlSOfELD6J590nxiI_2JshpsuwAEZGZVjQWB0TcvdR1HHD-PaGOfX2B1c5ADyybOBWn-GPIdl-S-cI0xlKhEAKbY3mQkt3XbbE6BhCuFZeD4"
                alt="User avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold leading-10 tracking-tight text-on-background mb-1">
            Your Green Impact
          </h1>
          <p className="text-on-surface-variant text-base">
            Real-time statistics of your contribution to a circular economy.
          </p>
        </header>

        {/* Top Stats Bento */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-on-surface-variant text-sm font-semibold tracking-wide">Credits Balance</span>
              <span className="text-primary text-xl">💳</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary leading-8">{animatedCredits} pts</div>
              <div className="text-xs text-secondary font-medium">Active balance</div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-on-surface-variant text-sm font-semibold tracking-wide">CO₂ Saved</span>
              <span className="text-primary text-xl">☁️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary leading-8">{wallet.co2_saved_kg}kg</div>
              <div className="text-xs text-secondary font-medium">
                Equivalent to {Math.round(wallet.co2_saved_kg * 1.4)} trees
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-on-surface-variant text-sm font-semibold tracking-wide">Total Actions</span>
              <span className="text-primary text-xl">♻️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary leading-8">
                {wallet.total_transactions} items
              </div>
              <div className="text-xs text-secondary font-medium">Lifetime contributions</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-container to-[#065f46] p-6 rounded-xl flex flex-col justify-between text-white hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold opacity-90 tracking-wide">Leaderboard Rank</span>
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <div className="text-2xl font-bold leading-8">
                #{wallet.leaderboard_rank || "—"} Global
              </div>
              <div className="text-xs opacity-90 font-medium">
                {wallet.leaderboard_rank && wallet.leaderboard_rank <= 3
                  ? "Top contributor"
                  : "Keep climbing!"}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Credits Wallet */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="glass-card p-6 rounded-xl">
              <h3 className="text-2xl font-semibold leading-8 mb-6 text-on-surface flex items-center gap-2">
                <span>💳</span> Credits Wallet
              </h3>

              {/* Progress Bar to next tier */}
              <div className="mb-10">
                <div className="flex justify-between text-sm font-semibold tracking-wide mb-1">
                  <span className="text-on-surface-variant">
                    {wallet.credits_balance >= 500 ? "Gold" : "Silver"} Tier
                  </span>
                  <span className="text-primary font-bold">{nextTierPoints} pts to next tier</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full shadow-sm transition-all duration-1000"
                    style={{ width: `${creditsProgress}%` }}
                  />
                </div>
              </div>

              {/* Transaction History */}
              <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                Recent Transactions
              </h4>
              <div className="space-y-3">
                {wallet.transaction_history.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors rounded-lg border border-transparent hover:border-outline-variant/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary text-xl">
                        {getActionIcon(tx.action_type)}
                      </div>
                      <div>
                        <div className="text-base font-bold text-on-surface">
                          {getActionLabel(tx.action_type)}
                        </div>
                        <div className="text-xs text-on-surface-variant font-medium">
                          {formatDate(tx.created_at)}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        tx.credits_earned > 0 ? "text-secondary" : "text-error"
                      }`}
                    >
                      {tx.credits_earned > 0 ? "+" : ""}
                      {tx.credits_earned} pts
                    </div>
                  </div>
                ))}
                {wallet.transaction_history.length === 0 && (
                  <p className="text-center text-on-surface-variant py-8">
                    No transactions yet. Start by listing an item!
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right: CO2 Impact */}
          <div className="lg:col-span-5">
            <section className="glass-card p-6 rounded-xl h-full flex flex-col">
              <h3 className="text-2xl font-semibold leading-8 mb-6 text-on-surface flex items-center gap-2">
                <span>📊</span> CO₂ Impact
              </h3>

              <div className="flex-1 flex flex-col justify-center items-center py-10">
                <div className="w-full max-w-[200px] aspect-square relative mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#impact-grad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="282.7"
                      strokeDashoffset={gaugeOffset}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="impact-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-bold text-primary leading-none tracking-tight">
                      {Math.round(co2Percent)}
                    </span>
                    <span className="text-sm font-semibold text-on-surface-variant tracking-wide">
                      Impact Score
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold tracking-wide mb-1">
                      <span className="text-on-surface-variant">You</span>
                      <span className="text-primary font-bold">{wallet.co2_saved_kg}kg saved</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container rounded-full transition-all duration-1000"
                        style={{ width: `${co2Percent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold tracking-wide mb-1">
                      <span className="text-on-surface-variant">Avg. User</span>
                      <span className="text-on-surface-variant font-bold">{avgCo2}kg saved</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-outline-variant rounded-full"
                        style={{ width: `${avgPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-primary-container/10 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-on-primary-container leading-relaxed">
                  <span className="font-bold">Summary:</span> You&apos;ve saved {co2Multiplier}x more
                  CO₂ than the average platform user. Keep listing items to reach the 10kg
                  milestone!
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom: Leaderboard */}
        <section className="mt-10">
          <div className="glass-card rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="text-2xl font-semibold leading-8 text-on-surface flex items-center gap-2">
                Green Champions 🏆
              </h3>
              <button className="text-sm font-semibold text-primary hover:underline transition-all">
                View All Rankings
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container text-sm font-semibold text-on-surface-variant tracking-wide">
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Total Credits</th>
                    <th className="px-6 py-3">CO₂ Offset</th>
                    <th className="px-6 py-3">Level</th>
                  </tr>
                </thead>
                <tbody className="text-base divide-y divide-outline-variant/10">
                  {leaderboard.map((entry, i) => {
                    const isCurrentUser = entry.id === userId;
                    const tier = getTierLabel(entry.credits_balance);
                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? "bg-primary-container/10 border-l-4 border-primary"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <td className={`px-6 py-6 font-bold ${isCurrentUser ? "text-primary" : ""}`}>
                          #{i + 1}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isCurrentUser
                                  ? "bg-primary-container text-on-primary-container"
                                  : i === 0
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-surface-container-highest text-on-surface-variant"
                              }`}
                            >
                              {isCurrentUser ? "YOU" : getInitials(entry.name)}
                            </div>
                            <span className={isCurrentUser ? "font-bold" : ""}>
                              {isCurrentUser ? `${entry.name} (You)` : entry.name}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-6 ${isCurrentUser ? "font-bold" : ""}`}>
                          {entry.credits_balance} pts
                        </td>
                        <td className={`px-6 py-6 ${isCurrentUser ? "font-bold" : ""}`}>
                          {entry.co2_saved_kg}kg
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`px-2 py-0.5 ${
                              isCurrentUser
                                ? "bg-primary-container text-on-primary-container"
                                : tier.className
                            } rounded-full text-xs font-bold uppercase`}
                          >
                            {tier.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                        No leaderboard data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low border-t border-outline-variant/20">
        <div className="flex flex-col gap-3">
          <div className="text-xl font-bold text-primary">SecondLife</div>
          <p className="text-sm font-semibold text-on-surface-variant max-w-sm">
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
      </footer>
    </div>
  );
}
