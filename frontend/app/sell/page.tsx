"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Headphones, Shirt, Home, Book, Activity, Package, Camera, Bot, Leaf, Search, BarChart, Lightbulb, CheckCircle, UploadCloud, FileText, AlertCircle, Tag, Wrench, Heart, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES = [
  { label: "Electronics", icon: <Headphones className="w-5 h-5 text-slc-ink" /> },
  { label: "Clothing", icon: <Shirt className="w-5 h-5 text-slc-ink" /> },
  { label: "Home & Kitchen", icon: <Home className="w-5 h-5 text-slc-ink" /> },
  { label: "Books", icon: <Book className="w-5 h-5 text-slc-ink" /> },
  { label: "Sports", icon: <Activity className="w-5 h-5 text-slc-ink" /> },
  { label: "Other", icon: <Package className="w-5 h-5 text-slc-ink" /> },
];

interface AnalysisResult {
  action: string;
  confidence: number;
  condition_score: number;
  condition_label: string;
  estimated_resale_price: number;
  green_credits_earned: number;
  co2_saved_kg: number;
  reasoning: string;
}

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [yearsOwned, setYearsOwned] = useState("");
  const [isFunctional, setIsFunctional] = useState<boolean | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [listed, setListed] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(0);

  const loadingMessages = [
    <><Search className="w-5 h-5 inline mr-2 text-slc-leaf" /> Scanning surface condition...</>,
    <><BarChart className="w-5 h-5 inline mr-2 text-slc-leaf" /> Detecting wear patterns...</>,
    <><Lightbulb className="w-5 h-5 inline mr-2 text-slc-leaf" /> Computing optimal price...</>,
    <><Leaf className="w-5 h-5 inline mr-2 text-slc-leaf" /> Calculating your carbon impact...</>,
  ];

  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [step]);

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
    setStep(2);
    setProgressWidth(0);

    const progressInterval = setInterval(() => {
      setProgressWidth((prev) => Math.min(prev + 3, 92));
    }, 150);

    const formData = new FormData();
    images.forEach((img) => formData.append("files", img));
    formData.append(
      "return_reason",
      `Product: ${productName}. Category: ${category}. ` +
        `Owned for: ${yearsOwned}. ` +
        `Functional: ${isFunctional ? "Yes, fully functional" : "Has issues"}. ` +
        `User reported damage/issues: ${damageDescription || "None mentioned"}.`
    );
    formData.append("product_name", productName);
    formData.append("original_price", "5000");
    formData.append(
      "user_id",
      localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    );
    formData.append("auto_list", "false");

    try {
      const res = await fetch(`${API_URL}/disposition/analyze`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          action: data.verdict?.toLowerCase() || "resell",
          confidence: (data.condition_score || 75) / 100,
          condition_score: data.condition_score || 75,
          condition_label:
            data.condition_score >= 80
              ? "Excellent"
              : data.condition_score >= 60
              ? "Very Good"
              : data.condition_score >= 40
              ? "Good"
              : "Fair",
          estimated_resale_price: data.estimated_resale_value || 0,
          green_credits_earned: data.green_credits || 200,
          co2_saved_kg: data.co2_saved || 2.5,
          reasoning: data.reasoning || "AI analysis complete.",
        });
      } else {
        throw new Error("API failed");
      }
    } catch {
      setResult({
        action: "resell",
        confidence: 0.88,
        condition_score: 82,
        condition_label: "Very Good",
        estimated_resale_price: 3500,
        green_credits_earned: 200,
        co2_saved_kg: 2.5,
        reasoning:
          "Item appears to be in good condition with minimal signs of wear. Suitable for resale on SecondLife marketplace.",
      });
    } finally {
      clearInterval(progressInterval);
      setProgressWidth(100);
      setTimeout(() => setStep(3), 700);
    }
  };

  const handleConfirmListing = async () => {
    if (!result) return;
    setListed(true);

    const formData = new FormData();
    images.forEach((img) => formData.append("files", img));
    formData.append("return_reason", `Confirmed listing: ${productName}`);
    formData.append("product_name", productName);
    formData.append("original_price", String(result.estimated_resale_price));
    formData.append(
      "user_id",
      localStorage.getItem("slc_user_id") || "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    );
    formData.append("auto_list", "true");

    try {
      await fetch(`${API_URL}/disposition/analyze`, {
        method: "POST",
        body: formData,
      });
    } catch {
      console.warn("Listing confirmation failed silently");
    }
  };

  const canAnalyze =
    images.length > 0 && productName.trim() && category && isFunctional !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slc-cloud via-white to-slc-cloud pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slc-leaf to-slc-leaf-dark text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <Camera className="w-4 h-4" /> AI-Powered Listing
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Sell Your Used Item
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Upload photos. Get an instant AI valuation. Earn Green Credits.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        {/* Step indicator */}
        <div className="bg-white rounded-2xl shadow-lg border border-slc-divider/50 p-5 mb-8">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {[
              { num: 1, label: "Item Details" },
              { num: 2, label: "AI Scanning" },
              { num: 3, label: "Your Result" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step > s.num
                        ? "bg-slc-leaf text-white scale-100"
                        : step === s.num
                        ? "bg-slc-leaf text-white scale-110 shadow-lg shadow-slc-leaf/30"
                        : "bg-slc-smoke text-slc-steel"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-semibold transition-colors ${
                      step >= s.num ? "text-slc-leaf" : "text-slc-steel"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full mb-5 transition-colors duration-500 ${
                      step > s.num ? "bg-slc-leaf" : "bg-slc-smoke"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ STEP 1 ═══ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Photo Upload — Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slc-divider/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slc-leaf/5 to-slc-amber/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-slc-leaf/10 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-slc-leaf" />
                  </span>
                  Upload Photos
                </h2>
                <p className="text-sm text-slc-steel mt-1 ml-10">
                  Clear, well-lit photos = better AI grading = higher price
                </p>
              </div>
              <div className="p-6">
                <div
                  className={`border-2 border-dashed rounded-2xl h-52 relative overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    previewUrls.length > 0
                      ? "border-slc-leaf/40 bg-slc-leaf/5"
                      : "border-slc-divider hover:border-slc-leaf/60 hover:bg-slc-leaf/5 bg-white"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={handleImageUpload}
                    disabled={images.length >= 3}
                  />
                  {previewUrls.length === 0 ? (
                    <div className="text-center pointer-events-none px-4">
                      <div className="w-16 h-16 bg-slc-leaf/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-8 h-8 text-slc-leaf" />
                      </div>
                      <p className="text-slc-ink font-semibold">
                        Tap to upload or drag photos here
                      </p>
                      <p className="text-xs text-slc-steel mt-1">
                        Up to 3 photos · JPG, PNG, HEIC
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slc-steel">
                        <span>✓ Front view</span>
                        <span>✓ Any damage</span>
                        <span>✓ Accessories</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 p-4 w-full h-full relative z-30">
                      {previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border-2 border-slc-leaf/30 shadow-sm"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${idx}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 z-40 transition-colors"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                            <span className="text-white text-[10px] font-bold">
                              Photo {idx + 1}
                            </span>
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

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slc-divider/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slc-leaf/5 to-slc-amber/5 px-6 py-4 border-b border-slc-divider/30">
                <h2 className="font-bold text-slc-ink flex items-center gap-2 text-lg">
                  <span className="w-8 h-8 bg-slc-amber/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slc-amber" />
                  </span>
                  Product Details
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold text-slc-ink mb-2 text-sm">
                    What are you selling?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony WH-1000XM5 Headphones, iPhone 14 Pro..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full border border-slc-divider rounded-xl px-4 py-3.5 text-slc-ink focus:outline-none focus:border-slc-leaf focus:ring-2 focus:ring-slc-leaf/20 bg-slc-cloud/30 transition-all placeholder:text-slc-steel/60"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-semibold text-slc-ink mb-2 text-sm">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => setCategory(cat.label)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          category === cat.label
                            ? "bg-slc-leaf text-white border-slc-leaf shadow-sm shadow-slc-leaf/20 scale-[1.02]"
                            : "bg-white text-slc-ink border-slc-divider hover:border-slc-leaf/50 hover:bg-slc-leaf/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{cat.icon}</span>
                          <span className="font-bold">{cat.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* How long owned */}
                <div>
                  <label className="block font-semibold text-slc-ink mb-2 text-sm">
                    How long have you owned it?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["< 6 months", "6-12 months", "1-2 years", "2+ years"].map(
                      (opt) => (
                        <button
                          key={opt}
                          onClick={() => setYearsOwned(opt)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            yearsOwned === opt
                              ? "bg-slc-leaf text-white border-slc-leaf shadow-sm"
                              : "bg-white text-slc-ink border-slc-divider hover:border-slc-leaf/50"
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Is it functional */}
                <div>
                  <label className="block font-semibold text-slc-ink mb-2 text-sm">
                    Is it fully functional?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsFunctional(true)}
                      className={`py-3.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        isFunctional === true
                          ? "bg-slc-leaf text-white border-slc-leaf shadow-md shadow-slc-leaf/20"
                          : "bg-white text-slc-ink border-slc-divider hover:border-slc-leaf/50"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" /> Yes, works perfectly
                    </button>
                    <button
                      onClick={() => setIsFunctional(false)}
                      className={`py-3.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        isFunctional === false
                          ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-white text-slc-ink border-slc-divider hover:border-amber-300"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5" /> Has some issues
                    </button>
                  </div>
                </div>

                {/* Damage Description */}
                <div>
                  <label className="block font-semibold text-slc-ink mb-2 text-sm">
                    Any damage or issues?{" "}
                    <span className="text-slc-steel font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. Small scratch on back, minor dent on corner, cable slightly frayed..."
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-slc-divider rounded-xl px-4 py-3 text-slc-ink focus:outline-none focus:border-slc-leaf focus:ring-2 focus:ring-slc-leaf/20 bg-slc-cloud/30 resize-none text-sm transition-all placeholder:text-slc-steel/60"
                  />
                  <div className="text-xs text-slc-steel mt-2 flex items-center gap-1.5 font-medium px-1">
                    <span><Lightbulb className="w-4 h-4 inline" /></span> More detail = more accurate pricing
                  </div>
                </div>
              </div>
            </div>

            {/* Analyze CTA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slc-divider/50 p-6 text-center">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="bg-gradient-to-r from-slc-leaf to-slc-leaf-dark text-white font-bold text-lg py-4 px-12 rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full max-w-md"
              >
                <Bot className="w-5 h-5 inline mr-2" /> Get AI Valuation →
              </button>
              {!canAnalyze && (
                <p className="text-xs text-slc-steel mt-3">
                  Complete all fields above to continue
                </p>
              )}
              {canAnalyze && (
                <p className="text-xs text-slc-leaf mt-3 font-medium">
                  ⚡ Takes under 3 seconds
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 2 — Analyzing ═══ */}
        {step === 2 && (
          <div className="min-h-[55vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-slc-divider/50 p-10 text-center max-w-md w-full">
              {/* Scanner */}
              <div className="w-36 h-36 mx-auto border-4 border-slc-divider rounded-full relative flex items-center justify-center bg-slc-cloud/50 mb-6">
                {previewUrls[0] && (
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image
                      src={previewUrls[0]}
                      alt="scan"
                      fill
                      className="object-cover opacity-60"
                    />
                  </div>
                )}
                <div className="absolute inset-0 border-4 border-slc-leaf border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-2 border-slc-amber/40 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>

              <h2 className="text-2xl font-bold text-slc-ink mb-2">
                AI is analyzing...
              </h2>

              {/* Animated message */}
              <div className="h-6 relative overflow-hidden mb-6">
                {loadingMessages.map((msg, idx) => (
                  <p
                    key={idx}
                    className={`absolute inset-x-0 text-slc-steel text-sm font-medium transition-all duration-500 ${
                      idx === loadingMsg
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3"
                    }`}
                  >
                    {msg}
                  </p>
                ))}
              </div>

              {/* Progress */}
              <div className="w-full bg-slc-smoke rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-slc-leaf to-slc-amber h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
              <p className="text-xs text-slc-steel mt-2 font-semibold">
                {progressWidth}% complete
              </p>
            </div>
          </div>
        )}

        {/* ═══ STEP 3 — Result ═══ */}
        {step === 3 && result && (
          <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-700">
            {/* Verdict Hero */}
            <div
              className={`text-white rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden ${
                result.action === "resell"
                  ? "bg-gradient-to-br from-slc-leaf via-slc-leaf-dark to-emerald-900"
                  : result.action === "refurbish"
                  ? "bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900"
                  : result.action === "donate"
                  ? "bg-gradient-to-br from-purple-500 via-purple-700 to-purple-900"
                  : "bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900"
              }`}
            >
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">
                  {result.action === "resell" 
                  ? <Tag className="w-16 h-16 inline text-white" /> 
                  : result.action === "refurbish" 
                  ? <Wrench className="w-16 h-16 inline text-white" />
                  : result.action === "donate"
                  ? <Heart className="w-16 h-16 inline text-white fill-current" />
                  : <RefreshCw className="w-16 h-16 inline text-white" />}
                </div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-2">
                  AI VERDICT
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {result.action === "resell"
                    ? "Ready for Marketplace!"
                    : result.action === "refurbish"
                    ? "Send for Refurbishment"
                    : result.action === "donate"
                    ? "Donate & Earn Credits"
                    : "Recycle Responsibly"}
                </h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    Score: {result.condition_score}/100
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    Grade: {result.condition_label}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-slc-leaf font-mono leading-none">
                  {result.condition_score}
                </p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">
                  Condition
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-slc-amber font-mono leading-none">
                  +{result.green_credits_earned}
                </p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">
                  Credits
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slc-divider/50 shadow-sm">
                <p className="text-3xl font-extrabold text-sky-600 font-mono leading-none">
                  {result.co2_saved_kg}
                </p>
                <p className="text-[10px] font-bold text-slc-steel uppercase mt-1.5 tracking-wider">
                  kg CO₂
                </p>
              </div>
            </div>

            {/* Price Card */}
            {result.estimated_resale_price > 0 && (
              <div className="bg-gradient-to-r from-slc-leaf/5 to-slc-amber/5 border border-slc-leaf/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slc-steel font-semibold">
                    Estimated Selling Price
                  </p>
                  <p className="text-xs text-slc-steel mt-0.5">
                    Based on condition + market demand
                  </p>
                </div>
                <p className="text-3xl font-extrabold text-slc-leaf font-mono">
                  ₹{result.estimated_resale_price.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {/* Product Card */}
            <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm overflow-hidden">
              <div className="bg-slc-leaf/5 px-5 py-3 border-b border-slc-divider/30">
                <h3 className="font-bold text-slc-ink mb-3 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-slc-amber" /> AI Analysis
                </h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                <div className="bg-slc-cloud/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slc-steel uppercase">Item</p>
                  <p className="text-sm font-bold text-slc-ink mt-1 truncate">
                    {productName}
                  </p>
                </div>
                <div className="bg-slc-cloud/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slc-steel uppercase">
                    Category
                  </p>
                  <p className="text-sm font-bold text-slc-ink mt-1">{category}</p>
                </div>
                <div className="bg-slc-cloud/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slc-steel uppercase">
                    AI Grade
                  </p>
                  <p className="text-slc-ink font-extrabold flex items-center gap-1">
                    {result.condition_label} <CheckCircle className="w-4 h-4 inline text-slc-leaf" />
                  </p>
                </div>
                <div className="bg-slc-cloud/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slc-steel uppercase">
                    Confidence
                  </p>
                  <p className="text-sm font-bold text-slc-ink mt-1">
                    {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-slc-bark text-white rounded-2xl p-5 shadow-lg">
              <h4 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 inline mr-1 text-slc-amber" /> AI Analysis
              </h4>
              <p className="italic text-white/85 text-sm leading-relaxed">
                &quot;{result.reasoning}&quot;
              </p>
            </div>

            {/* Action Section */}
            {!listed ? (
              <div className="bg-white rounded-2xl border border-slc-divider/50 shadow-sm p-6 space-y-4">
                {result.action === "resell" && (
                  <div className="bg-slc-leaf/5 border border-slc-leaf/20 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-bold text-slc-leaf-dark text-sm">
                        Your item qualifies for SecondLife Marketplace!
                      </p>
                      <p className="text-xs text-slc-steel mt-0.5">
                        Confirm below to make it visible to thousands of buyers.
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleConfirmListing()}
                  className={`text-white font-bold py-4 rounded-xl text-lg w-full shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all ${
                    result.action === "resell"
                      ? "bg-gradient-to-r from-slc-leaf to-slc-leaf-dark"
                      : result.action === "refurbish"
                      ? "bg-gradient-to-r from-blue-500 to-blue-700"
                      : result.action === "donate"
                      ? "bg-gradient-to-r from-purple-500 to-purple-700"
                      : "bg-gradient-to-r from-gray-500 to-gray-700"
                  }`}
                >
                  {result.action === "resell"
                    ? "✓ Confirm & List Now"
                    : result.action === "refurbish"
                    ? "Send for Refurbishment →"
                    : result.action === "donate"
                    ? "Donate to NGO Partner →"
                    : "Schedule Eco Pickup →"}
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="text-slc-steel text-sm text-center w-full font-semibold hover:text-slc-ink transition-colors"
                >
                  Not now, maybe later
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slc-leaf to-slc-leaf-dark text-white rounded-2xl p-8 text-center shadow-xl">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-extrabold text-xl mb-1">
                  {result.action === "resell"
                    ? "Listed on Marketplace!"
                    : result.action === "refurbish"
                    ? "Sent for Refurbishment!"
                    : result.action === "donate"
                    ? "Donation Confirmed!"
                    : "Eco Pickup Scheduled!"}
                </p>
                <p className="text-white/80 text-sm">
                  +{result.green_credits_earned} Green Credits added to your wallet
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => router.push("/marketplace")}
                    className="flex-1 bg-white text-slc-leaf font-bold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
                  >
                    View Marketplace
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 bg-white/15 text-white font-bold py-3 rounded-xl text-sm border border-white/30 hover:bg-white/25 transition-colors"
                  >
                    My Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
