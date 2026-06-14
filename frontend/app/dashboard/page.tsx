"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  credits_balance: number;
  co2_saved_kg: number;
}

function getActionIcon(type: string): string {
  switch (type) {
    case "resell_submitted": return "🏷️";
    case "refurb_purchased": return "🔧";
    case "donated": return "🎁";
    case "purchase": return "🛒";
    case "normal_return": return "↩️";
    default: return "💚";
  }
}

function getActionLabel(type: string): string {
  switch (type) {
    case "resell_submitted": return "Item Listed for Resell";
    case "refurb_purchased": return "Refurbished Purchase";
    case "donated": return "Item Donated";
    case "purchase": return "Marketplace Purchase";
    case "normal_return": return "Standard Return";
    default: return type.replace(/_/g, " ");
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [animCredits, setAnimCredits] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      try {
        const [wRes, lRes] = await Promise.all([
          fetch(`${API_URL}/credits/wallet/${userId}`),
          fetch(`${API_URL}/credits/leaderboard`),
        ]);
        if (wRes.ok) setWallet(await wRes.json());
        if (lRes.ok) setLeaderboard(await lRes.json());
      } catch {
        // Fallback handled by null check
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Animated counter
  useEffect(() => {
    if (!wallet) return;
    const target = wallet.credits_balance;
    const start = performance.now();
    const duration = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setAnimCredits(Math.floor(p * p * target)); // ease-in
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slc-cloud to-white">
        <div className="bg-gradient-to-r from-slc-leaf to-slc-leaf-dark py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-3" />
            <div className="h-5 w-96 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slc-divider/50" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-slc-cloud flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold">Could not load dashboard</h2>
          <button onClick={() => router.push("/")} className="mt-4 bg-slc-leaf text-white px-6 py-2 rounded-xl font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const userId = localStorage.getItem("slc_user_id") || "";
  const co2 = Number(wallet.co2_saved_kg) || 0;
  const credits = wallet.credits_balance || 0;
  const rank = wallet.leaderboard_rank || 0;
  const transactions = wallet.transaction_history || [];
  const userName = wallet.user?.name || "Shourya";

  // Level system
  let level = "Seedling 🌱";
  let nextThreshold = 500;
  if (credits >= 2000) { level = "Forest 🌳"; nextThreshold = credits; }
  else if (credits >= 1000) { level = "Tree 🌲"; nextThreshold = 2000; }
  else if (credits >= 500) { level = "Sapling 🌿"; nextThreshold = 1000; }
  const progressPct = Math.min(100, (credits / nextThreshold) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slc-cloud via-white to-slc-cloud pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slc-leaf via-slc-leaf-dark to-emerald-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/30">
              {userName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Hey, {userName}! 👋</h1>
              <p className="text-white/70 text-sm font-medium">Your SecondLife impact dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
              🏆 Rank #{rank}
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
              {level}
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
              {transactions.length} actions taken
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slc-divider/50 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-slc-leaf font-mono leading-none">{animCredits}</p>
            <p className="text-[10px] font-bold text-slc-steel uppercase mt-2 tracking-wider">Green Credits</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slc-divider/50 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-sky-600 font-mono leading-none">{co2}</p>
            <p className="text-[10px] font-bold text-slc-steel uppercase mt-2 tracking-wider">kg CO₂ Saved</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slc-divider/50 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-amber-500 font-mono leading-none">#{rank}</p>
            <p className="text-[10px] font-bold text-slc-steel uppercase mt-2 tracking-wider">Leaderboard</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slc-divider/50 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-purple-600 font-mono leading-none">{transactions.length}</p>
            <p className="text-[10px] font-bold text-slc-steel uppercase mt-2 tracking-wider">Total Actions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* CO₂ Impact Visualization */}
            <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slc-leaf/5 to-sky-500/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-slc-leaf/10 rounded-lg flex items-center justify-center">🌍</span>
                  Environmental Impact
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-44 h-44">
                    <svg width="176" height="176" viewBox="0 0 176 176" className="drop-shadow-sm">
                      <circle cx="88" cy="88" r="75" fill="none" stroke="#EAEDED" strokeWidth="12" />
                      <circle cx="88" cy="88" r="75" fill="none" stroke="#067D62" strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 75}`}
                        strokeDashoffset={`${2 * Math.PI * 75 * (1 - Math.min(co2 / 20, 1))}`}
                        strokeLinecap="round" transform="rotate(-90, 88, 88)"
                        className="transition-all duration-[2s] ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-slc-ink font-mono">{co2}</span>
                      <span className="text-xs font-bold text-slc-steel">kg CO₂</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slc-cloud/70 rounded-xl p-3 text-center border border-slc-divider/30">
                    <p className="text-xl mb-0.5">🌳</p>
                    <p className="text-lg font-extrabold text-slc-ink font-mono">{Math.round(co2 * 0.5)}</p>
                    <p className="text-[9px] font-bold text-slc-steel uppercase tracking-wider">Trees Equiv.</p>
                  </div>
                  <div className="bg-slc-cloud/70 rounded-xl p-3 text-center border border-slc-divider/30">
                    <p className="text-xl mb-0.5">🚗</p>
                    <p className="text-lg font-extrabold text-slc-ink font-mono">{Math.round(co2 * 4)}</p>
                    <p className="text-[9px] font-bold text-slc-steel uppercase tracking-wider">Km Saved</p>
                  </div>
                  <div className="bg-slc-cloud/70 rounded-xl p-3 text-center border border-slc-divider/30">
                    <p className="text-xl mb-0.5">💡</p>
                    <p className="text-lg font-extrabold text-slc-ink font-mono">{Math.round(co2 * 12)}</p>
                    <p className="text-[9px] font-bold text-slc-steel uppercase tracking-wider">Hrs LED</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/5 to-slc-leaf/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">📋</span>
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-slc-divider/50">
                {transactions.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-slc-steel font-medium">No activity yet. Start by listing an item!</p>
                  </div>
                ) : (
                  transactions.slice(0, 8).map((tx, i) => (
                    <div key={tx.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-slc-cloud/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        tx.credits_earned > 0 ? "bg-slc-leaf/10" : "bg-red-50"
                      }`}>
                        {getActionIcon(tx.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slc-ink truncate">{getActionLabel(tx.action_type)}</p>
                        <p className="text-xs text-slc-steel font-medium">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className={`font-extrabold font-mono text-sm ${
                        tx.credits_earned > 0 ? "text-slc-leaf" : "text-red-500"
                      }`}>
                        {tx.credits_earned > 0 ? "+" : ""}{tx.credits_earned} pts
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Credits Wallet */}
            <div className="bg-gradient-to-br from-slc-leaf via-slc-leaf-dark to-emerald-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Green Credits</p>
                <p className="text-4xl font-extrabold font-mono">{credits}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-white/70">{level}</span>
                    <span className="text-white/90">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/80 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1.5 text-center font-medium">
                    {nextThreshold - credits} pts to next level
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-5 py-3 border-b border-slc-divider/30">
                <h3 className="font-bold text-slc-ink flex items-center gap-2">
                  🏆 Green Champions
                </h3>
              </div>
              <div className="p-3">
                {leaderboard.map((user, idx) => {
                  const isMe = user.id === userId;
                  return (
                    <div key={user.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                      isMe ? "bg-slc-leaf/10 border border-slc-leaf/20" : "hover:bg-slc-cloud/50"
                    }`}>
                      <span className="w-6 text-center font-bold text-sm">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isMe ? "bg-slc-leaf text-white" : "bg-slc-smoke text-slc-ink border border-slc-divider"
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slc-ink truncate">
                          {user.name}{isMe && " (You)"}
                        </p>
                        <p className="text-[10px] text-slc-steel font-bold">{user.credits_balance} pts · {user.co2_saved_kg}kg</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm overflow-hidden">
              <button onClick={() => router.push("/sell")} className="w-full flex items-center gap-3 px-5 py-4 border-b border-slc-divider/50 hover:bg-slc-cloud/50 transition-colors text-left">
                <span className="w-9 h-9 bg-slc-leaf/10 rounded-xl flex items-center justify-center">📸</span>
                <span className="text-sm font-bold text-slc-ink">Sell an Item</span>
                <span className="ml-auto text-slc-steel text-xs">→</span>
              </button>
              <button onClick={() => router.push("/marketplace")} className="w-full flex items-center gap-3 px-5 py-4 border-b border-slc-divider/50 hover:bg-slc-cloud/50 transition-colors text-left">
                <span className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">🛍️</span>
                <span className="text-sm font-bold text-slc-ink">Browse Marketplace</span>
                <span className="ml-auto text-slc-steel text-xs">→</span>
              </button>
              <button onClick={() => router.push(`/return/49a5bb33-491a-40fd-8bf8-3c7ae1742ba8`)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slc-cloud/50 transition-colors text-left">
                <span className="w-9 h-9 bg-sky-500/10 rounded-xl flex items-center justify-center">↩️</span>
                <span className="text-sm font-bold text-slc-ink">Return a Purchase</span>
                <span className="ml-auto text-slc-steel text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
