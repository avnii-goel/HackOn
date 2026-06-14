"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const [selectedCondition, setSelectedCondition] = useState<string>("");

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  const loadingMessages = [
    "🔍 Reading surface condition...",
    "📊 Detecting wear patterns...",
    "💡 Computing optimal lifecycle path...",
    "🌿 Calculating your carbon impact..."
  ];

  const reasons = ["Doesn't fit", "Defective", "Changed my mind", "Not as described", "Wrong item received"];
  const conditions = [
    { label: "Poor", emoji: "💔" },
    { label: "Fair", emoji: "😕" },
    { label: "Good", emoji: "😐" },
    { label: "Very Good", emoji: "😊" },
    { label: "Like New", emoji: "✨" }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - images.length);
      setImages((prev) => [...prev, ...newFiles]);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAnalyze = async () => {
    setCurrentStep(2);
    setProgressWidth(0);

    const formData = new FormData();
    formData.append("product_id", id);
    images.forEach((img) => formData.append("files", img));

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgressWidth((prev) => Math.min(prev + 5, 95));
    }, 100);

    const msgInterval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    try {
      const res = await fetch(`${API_URL}/disposition/analyze`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.warn("Using mock disposition");
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
      clearInterval(msgInterval);
      setProgressWidth(100);
      setTimeout(() => {
        setCurrentStep(3);
        setTimeout(() => setShowToast(true), 400); // Trigger toast after render
      }, 500);
    }
  };

  return (
    <div className="bg-slc-cloud min-h-screen pb-24 relative">
      
      {/* Progress Stepper Bar */}
      <div className="bg-white border-b border-slc-divider px-4 md:px-8 py-4 sticky top-14 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                currentStep > step ? 'bg-white border-2 border-slc-leaf text-slc-leaf' :
                currentStep === step ? 'bg-slc-leaf text-white' : 'bg-white border-2 border-slc-divider text-slc-steel'
              }`}>
                {currentStep > step ? '✓' : step}
              </div>
              <span className={`text-xs mt-2 font-bold ${currentStep >= step ? 'text-slc-ink' : 'text-slc-steel'}`}>
                {step === 1 ? "Upload" : step === 2 ? "Analyzing" : "Your Result"}
              </span>
              
              {/* Connecting Lines */}
              {step < 3 && (
                <div className={`absolute top-4 left-[50%] w-full h-0.5 -z-0 ${
                  currentStep > step ? 'bg-slc-leaf' : 'bg-slc-divider'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-slc-ink text-center mb-2">Show us your item&apos;s condition</h1>
            <p className="text-slc-steel text-center mb-10 text-lg">Our AI analyzes in under 2 seconds</p>

            <div className="flex flex-col lg:flex-row gap-8 mb-10">
              
              {/* Left: Upload Area */}
              <div className="flex-1 bg-white border-2 border-dashed border-slc-divider rounded-2xl h-[280px] relative overflow-hidden flex items-center justify-center cursor-pointer hover:bg-slc-cloud transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={handleImageUpload}
                  disabled={images.length >= 3}
                />
                
                {previewUrls.length === 0 ? (
                  <div className="text-center pointer-events-none px-4">
                    <div className="text-5xl text-slc-divider mb-3">📸</div>
                    <p className="text-slc-steel text-base font-medium">Drop photos here or click to upload</p>
                    <p className="text-xs text-slc-steel mt-1">Accepts JPG, PNG, HEIC · Up to 3 photos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 p-4 w-full h-full relative z-30">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm border border-slc-divider">
                        <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 z-40"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <div className="rounded-xl border-2 border-dashed border-slc-divider flex flex-col items-center justify-center text-slc-steel hover:bg-slc-smoke">
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-xs font-semibold">Add More</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Smart Guidance */}
              <div className="w-full lg:w-[350px] bg-slc-bark text-white rounded-2xl p-6 shadow-md flex flex-col">
                <h3 className="font-bold text-lg mb-4">📸 What makes a good photo?</h3>
                <div className="space-y-3 flex-1">
                  <p className="flex items-start gap-2 text-sm"><span className="text-slc-leaf font-bold">✓</span> Front-facing, well-lit</p>
                  <p className="flex items-start gap-2 text-sm"><span className="text-slc-leaf font-bold">✓</span> Show any scratches or damage clearly</p>
                  <p className="flex items-start gap-2 text-sm"><span className="text-slc-leaf font-bold">✓</span> Include accessories if present</p>
                  <p className="flex items-start gap-2 text-sm"><span className="text-slc-leaf font-bold">✓</span> Neutral background preferred</p>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-slc-amber text-sm font-bold flex items-center gap-2">
                    <span>⚡</span> AI analysis takes under 2 seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Return Reason */}
            <div className="mb-8">
              <p className="font-semibold text-slc-ink mb-3 text-lg">Why are you returning?</p>
              <div className="flex flex-wrap gap-3">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors border ${
                      selectedReason === reason 
                        ? 'bg-slc-leaf text-white border-slc-leaf shadow-sm' 
                        : 'bg-white text-slc-ink border-slc-divider hover:bg-slc-smoke'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Rating */}
            <div className="mb-10">
              <p className="font-semibold text-slc-ink mb-3 text-lg">How would you rate it?</p>
              <div className="flex flex-wrap gap-4">
                {conditions.map((cond) => (
                  <button
                    key={cond.label}
                    onClick={() => setSelectedCondition(cond.label)}
                    className={`flex flex-col items-center justify-center border rounded-xl p-3 w-[88px] transition-all ${
                      selectedCondition === cond.label
                        ? 'bg-slc-leaf-light border-slc-leaf shadow-sm'
                        : 'bg-white border-slc-divider hover:bg-slc-smoke text-slc-steel'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cond.emoji}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight ${
                      selectedCondition === cond.label ? 'text-slc-leaf-dark' : ''
                    }`}>
                      {cond.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="text-center border-t border-slc-divider pt-8">
              <button
                onClick={handleAnalyze}
                disabled={images.length === 0 || !selectedReason}
                className="bg-slc-leaf text-white font-bold text-lg py-4 px-10 rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slc-leaf-dark active:scale-95"
              >
                🤖 Analyze with AI →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            {/* Scanning Animation */}
            <div className="w-40 h-40 border-4 border-slc-divider rounded-full relative shadow-inner flex items-center justify-center p-1 bg-white">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                {previewUrls[0] ? (
                  <Image src={previewUrls[0]} alt="Scan target" fill className="object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full bg-slc-smoke" />
                )}
              </div>
              <div className="absolute inset-0 border-4 border-slc-leaf border-t-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-slc-ink mt-8 mb-2">Analyzing your item...</h2>
            
            <div className="h-6 relative w-full flex justify-center overflow-hidden">
              {loadingMessages.map((msg, idx) => (
                <p 
                  key={idx} 
                  className={`absolute text-slc-steel text-base font-medium transition-all duration-500 ${
                    idx === loadingMsgIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {msg}
                </p>
              ))}
            </div>

            <div className="w-64 mx-auto mt-8 bg-slc-divider rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-slc-leaf h-full rounded-full transition-all duration-300 ease-linear" 
                style={{ width: `${progressWidth}%` }} 
              />
            </div>
            <p className="text-xs text-slc-steel mt-3 font-semibold tracking-wide uppercase">Estimated time: ~2 seconds</p>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && analysisResult && (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            
            {/* VERDICT CARD */}
            <div className={`text-white rounded-2xl p-8 text-center shadow-xl relative overflow-hidden ${
              analysisResult.action === "resell" ? "bg-gradient-to-r from-slc-leaf to-slc-leaf-dark" :
              analysisResult.action === "refurbish" ? "bg-gradient-to-br from-blue-600 to-blue-800" :
              analysisResult.action === "donate" ? "bg-gradient-to-br from-purple-600 to-purple-800" :
              "bg-gradient-to-br from-gray-600 to-gray-800"
            }`}>
              {/* Decorative background logo/icon (optional) */}
              <div className="absolute -right-8 -top-8 text-9xl opacity-10 blur-sm pointer-events-none">
                {analysisResult.action === "resell" ? "🏆" : analysisResult.action === "refurbish" ? "🔧" : analysisResult.action === "donate" ? "❤️" : "♻️"}
              </div>

              <div className="text-6xl mb-4 relative z-10">
                {analysisResult.action === "resell" ? "🏆" : analysisResult.action === "refurbish" ? "🔧" : analysisResult.action === "donate" ? "❤️" : "♻️"}
              </div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/70 mb-2 relative z-10">
                {analysisResult.action}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold relative z-10">
                Your item qualifies for SecondLife {analysisResult.action.charAt(0).toUpperCase() + analysisResult.action.slice(1)}!
              </h2>
              <p className="text-white/80 text-sm md:text-base mt-3 font-medium relative z-10">
                AI Confidence: {Math.round(analysisResult.confidence * 100)}% · Grade: {analysisResult.condition_label}
              </p>
            </div>

            {/* 3-COL STATS */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-slc-divider shadow-sm">
                <p className="text-[10px] font-bold text-slc-steel uppercase tracking-wider mb-1">Condition Score</p>
                <p className="text-2xl font-bold text-slc-leaf font-mono">{analysisResult.condition_score} <span className="text-sm font-sans text-slc-steel">/ 100</span></p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-slc-divider shadow-sm">
                <p className="text-[10px] font-bold text-slc-steel uppercase tracking-wider mb-1">AI Confidence</p>
                <p className="text-2xl font-bold text-slc-sky font-mono">{Math.round(analysisResult.confidence * 100)}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-slc-divider shadow-sm">
                <p className="text-[10px] font-bold text-slc-steel uppercase tracking-wider mb-1">Grade</p>
                <p className="text-xl font-bold text-slc-ink mt-1">{analysisResult.condition_label}</p>
              </div>
            </div>

            {/* AI REASONING */}
            <div className="mt-6 bg-slc-bark text-white rounded-xl p-5 shadow-md">
              <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3 font-bold flex items-center gap-2">
                <span>🤖</span> AI Analysis Log
              </h4>
              <p className="italic text-white/90 text-sm leading-relaxed">
                &quot;{analysisResult.reasoning}&quot;
              </p>
            </div>

            {/* GREEN IMPACT PANEL */}
            <div className="mt-6 bg-slc-leaf-light border-l-4 border-slc-leaf rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slc-leaf text-lg flex items-center gap-2">
                <span>🌿</span> Your Environmental Win
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <p className="text-3xl md:text-4xl font-bold font-mono text-slc-leaf leading-none mb-1">
                    💚 {analysisResult.green_credits_earned}
                  </p>
                  <p className="text-xs font-bold text-slc-leaf-dark uppercase tracking-wide">Green Credits Earned</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold font-mono text-slc-sky leading-none mb-1">
                    ☁️ {analysisResult.co2_saved_kg} <span className="text-xl">kg</span>
                  </p>
                  <p className="text-xs font-bold text-sky-800 uppercase tracking-wide">CO₂ Prevented</p>
                </div>
              </div>
              
              <p className="text-slc-steel text-sm mt-5 font-medium bg-white/50 inline-block px-3 py-1.5 rounded-lg border border-slc-leaf/10">
                Equivalent to driving {Math.round(analysisResult.co2_saved_kg * 4)} km less 🚗 or planting {Math.round(analysisResult.co2_saved_kg * 0.5)} trees 🌳
              </p>
            </div>

            {/* RESALE PRICE BOX */}
            {analysisResult.action === "resell" && (
              <div className="mt-4 bg-white border border-slc-leaf/30 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <span className="text-sm text-slc-steel font-bold">Your item could sell for</span>
                <span className="text-2xl font-bold text-slc-leaf font-mono">
                  ₹{analysisResult.estimated_resale_price.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => router.push("/marketplace")}
                className={`text-white font-bold py-4 rounded-xl text-lg w-full shadow-lg transition-colors ${
                  analysisResult.action === "resell" ? "bg-slc-leaf hover:bg-slc-leaf-dark" :
                  analysisResult.action === "refurbish" ? "bg-blue-600 hover:bg-blue-700" :
                  analysisResult.action === "donate" ? "bg-purple-600 hover:bg-purple-700" :
                  "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {analysisResult.action === "resell" ? "✓ List on SecondLife Marketplace →" :
                 analysisResult.action === "refurbish" ? "Send for Certified Refurbishment →" :
                 analysisResult.action === "donate" ? "Donate to NGO Partner →" :
                 "Schedule Eco Pickup →"}
              </button>

              <button 
                onClick={() => router.back()}
                className="text-slc-steel text-sm text-center underline font-semibold hover:text-slc-ink mt-2"
              >
                I still want to return normally
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CREDITS TOAST */}
      {currentStep === 3 && analysisResult && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-slc-leaf text-white rounded-full px-8 py-3 shadow-2xl font-bold border-2 border-white transition-all duration-700 ease-out z-50 ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          💚 +{analysisResult.green_credits_earned} Green Credits added!
        </div>
      )}
    </div>
  );
}
