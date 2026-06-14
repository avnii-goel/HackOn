"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Transaction {
  id: string;
  type: "purchase" | "resell" | "bonus";
  credits: number;
  description: string;
  created_at: string;
}

interface Wallet {
  user_id: string;
  balance: number;
  transactions?: Transaction[];
}

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_credits: number;
  co2_saved_kg: number;
  rank: number;
}

// Fallbacks
const fallbackWallet: Wallet = {
  user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  balance: 450,
  transactions: [
    { id: "tx1", type: "resell", credits: 200, description: "Resold Sony Headphones", created_at: new Date().toISOString() },
    { id: "tx2", type: "purchase", credits: -50, description: "Purchased Atomic Habits", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "tx3", type: "bonus", credits: 300, description: "Welcome Bonus", created_at: new Date(Date.now() - 172800000).toISOString() },
  ]
};

const fallbackLeaderboard: LeaderboardEntry[] = [
  { user_id: "u1", name: "Ananya", total_credits: 3200, co2_saved_kg: 84.5, rank: 1 },
  { user_id: "u2", name: "Rahul", total_credits: 2850, co2_saved_kg: 62.0, rank: 2 },
  { user_id: "u3", name: "Meera", total_credits: 1950, co2_saved_kg: 41.2, rank: 3 },
  { user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Priya", total_credits: 450, co2_saved_kg: 12.5, rank: 4 },
  { user_id: "u5", name: "Karan", total_credits: 120, co2_saved_kg: 3.1, rank: 5 },
];

export default function DashboardPage() {
  const router = useRouter();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      
      try {
        const wRes = await fetch(`${API_URL}/credits/wallet/${userId}`);
        const wData = wRes.ok ? await wRes.json() : fallbackWallet;
        setWallet(wData);

        const lRes = await fetch(`${API_URL}/credits/leaderboard`);
        const lData = lRes.ok ? await lRes.json() : fallbackLeaderboard;
        setLeaderboard(lData);
      } catch (err) {
        setWallet(fallbackWallet);
        setLeaderboard(fallbackLeaderboard);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-24 bg-slc-cloud text-center font-bold text-slc-steel">Loading dashboard...</div>;
  }

  if (!wallet) return null;

  const userId = localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const currentUser = leaderboard.find(l => l.user_id === userId) || fallbackLeaderboard[3];
  
  // Level calculation
  const credits = wallet.balance;
  let levelName = "Seedling";
  let nextLevel = "Sapling";
  let threshold = 100;
  let emoji = "🌱";
  
  if (credits >= 1000) { levelName = "Forest"; nextLevel = "Max"; threshold = credits; emoji = "🌳"; }
  else if (credits >= 500) { levelName = "Tree"; nextLevel = "Forest"; threshold = 1000; emoji = "🌲"; }
  else if (credits >= 100) { levelName = "Sapling"; nextLevel = "Tree"; threshold = 500; emoji = "🌿"; }

  const progressPct = Math.min(100, Math.max(0, (credits / threshold) * 100));
  const co2 = currentUser.co2_saved_kg;

  return (
    <div className="bg-slc-cloud min-h-screen pb-16">
      
      {/* WELCOME HEADER */}
      <div className="bg-slc-bark text-white px-4 md:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Good morning, {currentUser.name} 👋</h1>
          <p className="text-white/70 mb-6">Here&apos;s your SecondLife impact this month</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 shadow-sm">
              <span className="text-slc-leaf-light font-bold">💚 {wallet.balance} pts</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 shadow-sm">
              <span className="text-white font-bold">☁️ {co2} kg CO₂</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 shadow-sm">
              <span className="text-slc-amber font-bold">🏆 Rank #{currentUser.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-COL MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR (Profile + Quick Actions) */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          
          {/* User Profile */}
          <div className="bg-white rounded-xl border border-slc-divider p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-md border-2 border-slc-divider/50">
                {currentUser.name.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-slc-ink">{currentUser.name}</h2>
              <span className="bg-slc-leaf-light text-slc-leaf text-xs font-bold px-3 py-1 rounded-full mt-1 border border-slc-leaf/20">
                Level: {levelName}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs font-bold text-slc-ink mb-1.5">
                <span>XP Progress</span>
                <span className="text-slc-leaf">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2.5 bg-slc-smoke rounded-full overflow-hidden">
                <div className="h-full bg-slc-leaf transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[11px] text-slc-steel text-center mt-2 font-medium">
                {credits} / {threshold} to {nextLevel}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slc-divider overflow-hidden shadow-sm">
            <button onClick={() => router.push('/product/1')} className="w-full flex items-center gap-3 px-6 py-4 border-b border-slc-divider hover:bg-slc-cloud transition-colors text-left group">
              <span className="text-slc-leaf text-xl group-hover:scale-110 transition-transform">↩</span>
              <span className="text-sm font-bold text-slc-ink">Return an Item</span>
            </button>
            <button onClick={() => router.push('/marketplace')} className="w-full flex items-center gap-3 px-6 py-4 border-b border-slc-divider hover:bg-slc-cloud transition-colors text-left group">
              <span className="text-slc-amber text-xl group-hover:scale-110 transition-transform">🛍️</span>
              <span className="text-sm font-bold text-slc-ink">Browse Marketplace</span>
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slc-cloud transition-colors text-left group">
              <span className="text-slc-sky text-xl group-hover:scale-110 transition-transform">📋</span>
              <span className="text-sm font-bold text-slc-ink">View All Transactions</span>
            </button>
          </div>
        </div>

        {/* CENTER MAIN */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          
          {/* CO2 Impact SVG */}
          <div className="bg-white rounded-xl border border-slc-divider p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slc-ink mb-6">🌍 Your Environmental Impact</h2>
            
            <div className="flex justify-center mb-8 relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-sm">
                <circle cx="100" cy="100" r="85" fill="none" stroke="var(--color-slc-smoke)" strokeWidth="14" />
                <circle 
                  cx="100" cy="100" r="85" fill="none" stroke="var(--color-slc-leaf)" strokeWidth="14"
                  strokeDasharray={`${2 * Math.PI * 85}`} 
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - Math.min(co2/50, 1))}`}
                  strokeLinecap="round" transform="rotate(-90, 100, 100)"
                  className="transition-all duration-1000 ease-out"
                />
                <text x="100" y="95" textAnchor="middle" className="text-4xl font-bold font-mono fill-slc-ink">
                  {co2}
                </text>
                <text x="100" y="120" textAnchor="middle" className="text-xs font-bold fill-slc-steel">
                  kg CO₂ saved
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slc-cloud rounded-xl p-3 border border-slc-divider/50">
                <p className="text-2xl mb-1">🌳</p>
                <p className="font-bold text-slc-ink">{Math.round(co2 * 0.5)}</p>
                <p className="text-[10px] text-slc-steel font-bold uppercase tracking-wider">Trees</p>
              </div>
              <div className="bg-slc-cloud rounded-xl p-3 border border-slc-divider/50">
                <p className="text-2xl mb-1">🚗</p>
                <p className="font-bold text-slc-ink">{Math.round(co2 * 4)}</p>
                <p className="text-[10px] text-slc-steel font-bold uppercase tracking-wider">Km Less</p>
              </div>
              <div className="bg-slc-cloud rounded-xl p-3 border border-slc-divider/50">
                <p className="text-2xl mb-1">💡</p>
                <p className="font-bold text-slc-ink">{Math.round(co2 * 12)}</p>
                <p className="text-[10px] text-slc-steel font-bold uppercase tracking-wider">Hrs LED</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl border border-slc-divider p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slc-ink mb-4">Recent Activity</h2>
            <div className="space-y-0">
              {(wallet.transactions || []).length === 0 ? (
                <p className="text-center text-slc-steel py-6 font-medium">No transactions yet.</p>
              ) : (
                (wallet.transactions || []).map((tx, idx) => (
                  <div key={tx.id || idx} className="flex items-center gap-4 py-4 border-b border-slc-divider last:border-0 hover:bg-slc-cloud/50 transition-colors px-2 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.credits >= 0 ? "bg-slc-leaf-light text-slc-leaf" : "bg-red-50 text-red-500"
                    }`}>
                      {tx.type === "resell" ? "🔄" : tx.type === "purchase" ? "🛍️" : "🎁"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slc-ink">{tx.description}</p>
                      <p className="text-xs text-slc-steel mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold font-mono ${tx.credits >= 0 ? "text-slc-leaf" : "text-red-500"}`}>
                      {tx.credits > 0 ? "+" : ""}{tx.credits}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Leaderboard & Level) */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          
          <div className="bg-white rounded-xl border border-slc-divider p-5 shadow-sm">
            <h2 className="font-bold text-base text-slc-ink">🏆 Top Circular Heroes</h2>
            <p className="text-xs text-slc-steel font-medium mb-4">Global leaderboard</p>
            
            <div className="space-y-1">
              {leaderboard.map((user, idx) => {
                const isMe = user.user_id === userId;
                return (
                  <div key={idx} className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                    isMe ? "bg-slc-leaf-light border border-slc-leaf/20" : "hover:bg-slc-cloud"
                  }`}>
                    <div className="w-6 text-center font-bold text-sm">
                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slc-smoke flex items-center justify-center text-slc-ink font-bold text-xs border border-slc-divider shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slc-ink leading-tight">{user.name}{isMe && " (You)"}</span>
                      <span className="text-[10px] font-bold text-slc-steel">{user.total_credits} pts</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-bold text-slc-leaf bg-white px-2 py-0.5 rounded-full border border-slc-leaf/10 whitespace-nowrap">
                        🌿 {user.co2_saved_kg}kg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[11px] text-slc-steel text-center mt-5 font-medium bg-slc-cloud py-2 rounded-lg">
              You&apos;re ranked #{currentUser.rank} out of 1,247 SecondLife users
            </p>
          </div>

          <div className="bg-slc-leaf-light border border-slc-leaf/30 rounded-xl p-6 text-center shadow-sm relative overflow-hidden">
            <div className="text-6xl mb-3 relative z-10">{emoji}</div>
            <h3 className="font-bold text-slc-leaf text-xl relative z-10">{levelName}</h3>
            <p className="text-xs text-slc-leaf-dark font-medium mt-1 relative z-10">
              Keep returning items to grow your forest
            </p>
            
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 blur-[2px] pointer-events-none z-0">
              {emoji}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
