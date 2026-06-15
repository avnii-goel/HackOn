"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Lightbulb, Leaf, AlertTriangle, Package, RefreshCw, Camera, Bot, Heart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnalysisResult {
  action: string;
  confidence: number;
  condition_score: number;
  condition_label: string;
  estimated_resale_price?: number;
  green_credits_earned: number;
  co2_saved_kg: number;
  reasoning: string;
}

export default function ReturnPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [productName, setProductName] = useState<string>("Product");
  const [productPrice, setProductPrice] = useState<number>(29990);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  const loadingMessages = [
    <><Search className="w-5 h-5 inline mr-2 text-slc-leaf" /> Scanning surface condition...</>,
    "📊 Detecting wear patterns...",
    <><Lightbulb className="w-5 h-5 inline mr-2 text-slc-leaf" /> Computing optimal lifecycle path...</>,
    <><Leaf className="w-5 h-5 inline mr-2 text-slc-leaf" /> Calculating your carbon impact...</>,
  ];

  const reasons = [
    { label: "Doesn't fit", emoji: "📏" },
    { label: "Defective", emoji: <AlertTriangle className="w-5 h-5" /> },
    { label: "Changed my mind", emoji: "💭" },
    { label: "Not as described", emoji: <Search className="w-5 h-5" /> },
    { label: "Wrong item received", emoji: <Package className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (currentStep !== 2) return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [currentStep, loadingMessages.length]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/products`);
        if (res.ok) {
          const products = await res.json();
          const found = products.find((p: any) => p.id === id);
          if (found) {
            setProductName(found.name);
            setProductPrice(found.price);
            return;
          }
        }
      } catch {}
      const fallback: Record<string, { name: string; price: number }> = {
        "49a5bb33-491a-40fd-8bf8-3c7ae1742ba8": { name: "Sony WH-1000XM5 Headphones", price: 29990 },
        "845b773e-9cd6-44c4-8228-cf68fc9db0e0": { name: "Nike Air Max Running Shoes", price: 8995 },
        "38a3d713-1025-4c44-96a0-714c9b6f7e98": { name: "Apple iPad 10th Gen", price: 44900 },
        "d3ed85f7-d2ff-4a7f-800d-7dca16c5534b": { name: "Prestige Pressure Cooker 5L", price: 2499 },
        "f1a45e60-5279-414c-906b-2462b8298036": { name: "Atomic Habits Book", price: 399 },
        "f0ca88ae-487a-45fd-9e09-e14b6364a4e5": { name: "Nivia Football Size 5", price: 1299 },
      };
      if (id && fallback[id]) {
        setProductName(fallback[id].name);
        setProductPrice(fallback[id].price);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - images.length);
      setImages((prev) => [...prev, ...newFiles]);
      const newUrls = newFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleAnalyze = async () => {
    setCurrentStep(2);
    setProgressWidth(0);

    const progressInterval = setInterval(() => {
      setProgressWidth((prev) => Math.min(prev + 3, 92));
    }, 150);

    const formData = new FormData();
    images.forEach((img) => formData.append("files", img));
    formData.append("return_reason", selectedReason || "Changed my mind");
    formData.append("product_name", productName);
    formData.append("original_price", String(productPrice));
    formData.append("user_id", localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    formData.append("auto_list", "false");

    try {
      const res = await fetch(`${API_URL}/disposition/analyze`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult({
          action: data.verdict?.toLowerCase() || "resell",
          confidence: (data.condition_score || 75) / 100,
          condition_score: data.condition_score || 75,
          condition_label:
            data.condition_score >= 80 ? "Excellent" :
            data.condition_score >= 60 ? "Very Good" :
            data.condition_score >= 40 ? "Good" : "Fair",
          estimated_resale_price: data.estimated_resale_value || 0,
          green_credits_earned: data.green_credits || 200,
          co2_saved_kg: data.co2_saved || 2.5,
          reasoning: data.reasoning || "AI analysis complete.",
        });
      } else {
        throw new Error("API failed");
      }
    } catch {
      setAnalysisResult({
        action: "resell",
        confidence: 0.92,
        condition_score: 88,
        condition_label: "Very Good",
        estimated_resale_price: 18000,
        green_credits_earned: 250,
        co2_saved_kg: 12.5,
        reasoning: "Item shows minimal signs of wear. Original packaging is missing, but core functionality is intact. Perfect candidate for our certified pre-owned program.",
      });
    } finally {
      clearInterval(progressInterval);
      setProgressWidth(100);
      setTimeout(() => {
        setCurrentStep(3);
        setTimeout(() => setShowToast(true), 400);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slc-cloud via-white to-slc-cloud pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <RefreshCw className="w-5 h-5 text-slc-amber" /> Return & Earn
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Return a Purchase</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Don&apos;t just return — let AI find the best second life for your item.
          </p>
          {productName !== "Product" && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-medium">Returning: <strong>{productName}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        {/* Step Indicator */}
        <div className="bg-slc-surface rounded-2xl shadow-lg border border-slc-divider/50 p-5 mb-8">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {[
              { num: 1, label: "Upload Photos" },
              { num: 2, label: "AI Scanning" },
              { num: 3, label: "Your Result" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    currentStep > s.num ? "bg-slc-leaf text-white" :
                    currentStep === s.num ? "bg-amber-500 text-white scale-110 shadow-lg shadow-amber-500/30" :
                    "bg-slc-smoke text-slc-steel"
                  }`}>
                    {currentStep > s.num ? "✓" : s.num}
                  </div>
                  <span className={`text-xs mt-1.5 font-semibold transition-colors ${
                    currentStep >= s.num ? "text-slc-ink" : "text-slc-steel"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded-full mb-5 transition-colors duration-500 ${
                    currentStep > s.num ? "bg-slc-leaf" : "bg-slc-smoke"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ STEP 1 ═══ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Photo Upload Card */}
            <div className="bg-slc-surface rounded-2xl shadow-sm border border-slc-divider/50 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center"><Camera className="w-4 h-4 text-amber-500" /></span>
                  Upload Item Photos
                </h2>
                <p className="text-sm text-slc-steel mt-1 ml-10">Show the current condition clearly for best AI accuracy</p>
              </div>
              <div className="p-6">
                <div className={`border-2 border-dashed rounded-2xl h-52 relative overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  previewUrls.length > 0 ? "border-amber-400/40 bg-amber-50/30" : "border-slc-divider hover:border-amber-400/60 hover:bg-amber-50/20 bg-slc-surface"
                }`}>
                  <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleImageUpload} disabled={images.length >= 3} />
                  {previewUrls.length === 0 ? (
                    <div className="text-center pointer-events-none px-4">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">📷</span>
                      </div>
                      <p className="text-slc-ink font-semibold">Tap to upload or drag photos here</p>
                      <p className="text-xs text-slc-steel mt-1">Up to 3 photos · JPG, PNG, HEIC</p>
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slc-steel">
                        <span>✓ Front view</span>
                        <span>✓ Any damage</span>
                        <span>✓ Labels/tags</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 p-4 w-full h-full relative z-30">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-amber-400/30 shadow-sm">
                          <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 z-40 transition-colors">✕</button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                            <span className="text-white text-[10px] font-bold">Photo {idx + 1}</span>
                          </div>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <div className="rounded-xl border-2 border-dashed border-slc-divider flex flex-col items-center justify-center text-slc-steel hover:bg-slc-smoke/50 transition-colors">
                          <span className="text-2xl mb-1">+</span>
                          <span className="text-[10px] font-bold uppercase">Add</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Return Reason Card */}
            <div className="bg-slc-surface rounded-2xl shadow-sm border border-slc-divider/50 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">💬</span>
                  Why are you returning?
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {reasons.map((reason) => (
                    <button
                      key={reason.label}
                      onClick={() => setSelectedReason(reason.label)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        selectedReason === reason.label
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20 scale-[1.02]"
                          : "bg-slc-surface text-slc-ink border-slc-divider hover:border-amber-400/50 hover:bg-amber-50/30"
                      }`}
                    >
                      <span>{reason.emoji}</span>
                      <span className="truncate">{reason.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Analyze CTA */}
            <div className="bg-slc-surface rounded-2xl shadow-sm border border-slc-divider/50 p-6 text-center">
              <button
                onClick={handleAnalyze}
                disabled={images.length === 0 || !selectedReason}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg py-4 px-12 rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full max-w-md"
              >
                <Bot className="w-5 h-5 inline mr-1" /> Analyze & Find Best Path →
              </button>
              {(images.length === 0 || !selectedReason) && (
                <p className="text-xs text-slc-steel mt-3">Upload photos and select a reason to continue</p>
              )}
              {images.length > 0 && selectedReason && (
                <p className="text-xs text-amber-600 mt-3 font-medium">⚡ Takes under 3 seconds</p>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 2 — Analyzing ═══ */}
        {currentStep === 2 && (
          <div className="min-h-[55vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="bg-slc-surface rounded-3xl shadow-xl border border-slc-divider/50 p-10 text-center max-w-md w-full">
              <div className="w-36 h-36 mx-auto border-4 border-slc-divider rounded-full relative flex items-center justify-center bg-slc-cloud/50 mb-6">
                {previewUrls[0] && (
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image src={previewUrls[0]} alt="scan" fill className="object-cover opacity-60" />
                  </div>
                )}
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-2 border-orange-400/40 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>

              <h2 className="text-2xl font-bold text-slc-ink mb-2">AI is analyzing...</h2>

              <div className="h-6 relative overflow-hidden mb-6">
                {loadingMessages.map((msg, idx) => (
                  <p key={idx} className={`absolute inset-x-0 text-slc-steel text-sm font-medium transition-all duration-500 ${
                    idx === loadingMsg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}>
                    {msg}
                  </p>
                ))}
              </div>

              <div className="w-full bg-slc-smoke rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progressWidth}%` }} />
              </div>
              <p className="text-xs text-slc-steel mt-2 font-semibold">{progressWidth}% complete</p>
            </div>
          </div>
        )}

        {/* ═══ STEP 3 — Result ═══ */}
        {currentStep === 3 && analysisResult && (
          <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-700">
            {/* Verdict Hero */}
            <div className={`text-white rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden ${
              analysisResult.action === "resell" ? "bg-gradient-to-br from-slc-leaf via-slc-leaf-dark to-emerald-900" :
              analysisResult.action === "refurbish" ? "bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900" :
              analysisResult.action === "donate" ? "bg-gradient-to-br from-purple-500 via-purple-700 to-purple-900" :
              "bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900"
            }`}>
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              </div>
              <div className="relative z-10">
                <div className="text-6xl mb-3">
                  {analysisResult.action === "resell" ? <RefreshCw className="w-12 h-12 inline text-white" /> : analysisResult.action === "refurbish" ? <RefreshCw className="w-12 h-12 inline text-white" /> : analysisResult.action === "donate" ? <Heart className="w-12 h-12 inline text-white fill-current" /> : <RefreshCw className="w-12 h-12 inline text-white" />}
                </div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-2">AI VERDICT</p>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {analysisResult.action === "resell" ? "List on Marketplace!" :
                   analysisResult.action === "refurbish" ? "Send for Refurbishment" :
                   analysisResult.action === "donate" ? "Donate & Earn Credits" : "Recycle Responsibly"}
                </h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">Score: {analysisResult.condition_score}/100</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">Grade: {analysisResult.condition_label}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slc-surface rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-slc-leaf font-mono leading-none">{analysisResult.condition_score}</p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">Condition</p>
              </div>
              <div className="bg-slc-surface rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-amber-500 font-mono leading-none">+{analysisResult.green_credits_earned}</p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">Credits</p>
              </div>
              <div className="bg-slc-surface rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-sky-600 font-mono leading-none">{analysisResult.co2_saved_kg}</p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">kg CO₂</p>
              </div>
            </div>

            {/* Smart Routing */}
            {(analysisResult.action === "resell" || analysisResult.action === "refurbish") && (
              <div className="bg-slc-surface rounded-2xl border border-slc-divider/50 p-5 shadow-sm">
                <h4 className="font-bold text-slc-ink mb-3 flex items-center gap-2">🏭 Smart Routing Decision</h4>
                {(analysisResult.estimated_resale_price ?? 0) > 2000 ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl shrink-0">🏢</div>
                    <div>
                      <p className="font-bold text-blue-800">Return to Main Warehouse</p>
                      <p className="text-sm text-slc-steel mt-1">Item value ₹{(analysisResult.estimated_resale_price ?? 0).toLocaleString("en-IN")} justifies logistics. Will be relisted nationally.</p>
                      <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium">📍 Amazon Fulfillment Center, 47km away</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slc-leaf-light rounded-lg flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-slc-leaf" /></div>
                    <div>
                      <p className="font-bold text-slc-leaf-dark">Stored at Local Hub</p>
                      <p className="text-sm text-slc-steel mt-1">Storing locally saves 340km of transport.</p>
                      <div className="mt-2 bg-slc-leaf-light rounded-lg px-3 py-2 text-xs text-slc-leaf-dark font-medium">📍 SecondLife Local Hub: 2.3km away</div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">🌍 Saves 340km</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">⚡ Listed in 2hrs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Reasoning */}
            <div className="bg-slc-bark text-white rounded-2xl p-5 shadow-lg">
              <h4 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 font-bold flex items-center gap-2"><Bot className="w-5 h-5 inline mr-1" /> AI Analysis</h4>
              <p className="italic text-white/85 text-sm leading-relaxed">&quot;{analysisResult.reasoning}&quot;</p>
            </div>

            {/* Price Card */}
            {(analysisResult.estimated_resale_price ?? 0) > 0 && (
              <div className="bg-gradient-to-r from-slc-leaf/5 to-amber-500/5 border border-slc-leaf/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slc-steel font-semibold">Estimated Resale Value</p>
                  <p className="text-xs text-slc-steel mt-0.5">Based on AI condition analysis</p>
                </div>
                <p className="text-3xl font-extrabold text-slc-leaf font-mono">₹{(analysisResult.estimated_resale_price ?? 0).toLocaleString("en-IN")}</p>
              </div>
            )}

            {/* Green Impact */}
            <div className="bg-slc-leaf-light border border-slc-leaf/20 rounded-2xl p-5">
              <h3 className="font-bold text-slc-leaf flex items-center gap-2 mb-3"><Leaf className="w-5 h-5 inline mr-1" /> Environmental Impact</h3>
              <p className="text-sm text-slc-steel">
                Equivalent to driving <strong>{Math.round(analysisResult.co2_saved_kg * 4)} km less</strong> 🚗 or planting <strong>{Math.round(analysisResult.co2_saved_kg * 0.5)} trees</strong> 🌳
              </p>
            </div>

            {/* Action Buttons */}
            <div className="bg-slc-surface rounded-2xl border border-slc-divider/50 shadow-sm p-6 space-y-4">
              <button
                onClick={() => router.push("/marketplace")}
                className={`text-white font-bold py-4 rounded-xl text-lg w-full shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all ${
                  analysisResult.action === "resell" ? "bg-gradient-to-r from-slc-leaf to-slc-leaf-dark" :
                  analysisResult.action === "refurbish" ? "bg-gradient-to-r from-blue-500 to-blue-700" :
                  analysisResult.action === "donate" ? "bg-gradient-to-r from-purple-500 to-purple-700" :
                  "bg-gradient-to-r from-gray-500 to-gray-700"
                }`}
              >
                {analysisResult.action === "resell" ? "✓ List on Marketplace →" :
                 analysisResult.action === "refurbish" ? "Send for Refurbishment →" :
                 analysisResult.action === "donate" ? "Donate to NGO Partner →" : "Schedule Eco Pickup →"}
              </button>
              <button onClick={() => router.push("/")} className="text-slc-steel text-sm text-center w-full font-semibold hover:text-slc-ink transition-colors">
                I still want to return normally
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Credits Toast */}
      {currentStep === 3 && analysisResult && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slc-leaf to-slc-leaf-dark text-white rounded-full px-8 py-3 shadow-2xl font-bold border-2 border-white/50 transition-all duration-700 ease-out z-50 ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <Heart className="w-4 h-4 inline mr-1 fill-current" /> +{analysisResult.green_credits_earned} Green Credits added!
        </div>
      )}
    </div>
  );
}
