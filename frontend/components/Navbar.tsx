"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getWallet } from "@/lib/api";

const USERS = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Shourya Agrawal" },
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "Priya Sharma" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");

  useEffect(() => {
    const userId = localStorage.getItem("slc_user_id");
    if (!userId) {
      localStorage.setItem("slc_user_id", USERS[0].id);
      setCurrentUser(USERS[0].id);
    } else {
      setCurrentUser(userId);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCredits = async () => {
      try {
        const data = await getWallet(currentUser);
        setCredits(data.credits_balance);
      } catch {
        setCredits(null);
      }
    };
    fetchCredits();
  }, [currentUser]);

  const handleUserSwitch = (userId: string) => {
    localStorage.setItem("slc_user_id", userId);
    setCurrentUser(userId);
    setShowDropdown(false);
    window.location.reload();
  };

  const currentUserData = USERS.find((u) => u.id === currentUser);
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        {/* Brand */}
        <div
          className="text-2xl font-bold text-primary flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <span>🌿</span> SecondLife
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-base">
          <a
            href="/"
            className={`transition-colors ${
              isActive("/")
                ? "text-primary font-bold border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Home
          </a>
          <a
            href="/marketplace"
            className={`transition-colors ${
              isActive("/marketplace")
                ? "text-primary font-bold border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Marketplace
          </a>
          <a
            href="/dashboard"
            className={`transition-colors ${
              isActive("/dashboard")
                ? "text-primary font-bold border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Dashboard
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 relative">
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:scale-105 transition-transform duration-200 cursor-pointer">
            💚 {credits !== null ? credits : "—"} pts
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 transition-transform"
            >
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEPEOl_Ah6HUkOF6VnE61KhyfxeeddhWY8mBPbw1ce3T-qLJwce4ghuUfsNPxneMedcWixPrGSA9JWuEJjsVI8CJLaN3QWjb0Q4iEFGXoFXFcESGz4EpgHwX0xTpOvL5SVRMesplkSe_uYXQi-FbdG-EKJu_4bDNBzaWHcO9mx4dsSjy2128rjy6j2bNxDhPQSpHXm5Cw5O-6t93yY7zpUvnkKqcaZugLEhrna5t2PtBO3LoaRQDqzX_Wnimzn5m1NpzvGM8VLVpI"
                alt="User avatar"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-12 bg-surface border border-outline-variant/20 rounded-xl shadow-xl py-2 w-56 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10 mb-1">
                  Switch User
                </div>
                {USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2 ${
                      currentUser === user.id ? "bg-primary-container/10 text-primary font-bold" : "text-on-surface"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentUser === user.id
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {user.name[0]}
                    </div>
                    {user.name}
                    {currentUser === user.id && <span className="ml-auto text-primary">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/20 h-14 flex items-center justify-around z-50">
        <a href="/" className={`flex flex-col items-center text-xs ${isActive("/") ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="text-lg">🏠</span>
          Home
        </a>
        <a href="/marketplace" className={`flex flex-col items-center text-xs ${isActive("/marketplace") ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="text-lg">🛒</span>
          Market
        </a>
        <a href="/dashboard" className={`flex flex-col items-center text-xs ${isActive("/dashboard") ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="text-lg">📊</span>
          Dashboard
        </a>
      </div>
    </nav>
  );
}
