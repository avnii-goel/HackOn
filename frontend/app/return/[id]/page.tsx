"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { getProducts, analyzeDisposition, interceptReturn } from "@/lib/api";

interface AnalysisResult {
  condition_score: number;
  defects: string[];
  verdict: string;
  reasoning: string;
  estimated_resale_value: number;
  co2_saved: number;
  green_credits: number;
  ai_description: string;
  listing_id: string | null;
  image_urls: string[];
}

type Phase = "intercept" | "disposition";
type Step = 1 | 2 | 3;

const RETURN_REASONS = [
  "Wrong size",
  "Damaged in transit",
  "Not as described",
  "Changed mind",
  "Defective",
];

const CONFETTI_COLORS = ["#10b981", "#006c49", "#a6f2d1", "#fbbf24"];

function formatPrice(price: number): string {
  return `₹${Math.round(price).toLocaleString("en-IN")}`;
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "Resell":
      return "bg-primary text-on-primary";
    case "Refurbish":
      return "bg-secondary text-on-secondary";
    case "Donate":
      return "bg-amber-500 text-white";
    case "Recycle":
      return "bg-on-surface-variant text-surface";
    default:
      return "bg-primary text-on-primary";
  }
}

export default function ReturnPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [phase, setPhase] = useState<Phase>("intercept");
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stepVisible, setStepVisible] = useState(true);
  const [productName, setProductName] = useState("Your Product");
  const [originalPrice, setOriginalPrice] = useState(0);

  // Fetch product info on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await getProducts();
        const found = products.find((p: { id: string }) => p.id === productId);
        if (found) {
          setProductName(found.name);
          setOriginalPrice(found.price);
        }
      } catch {
        // silently fail, use defaults
      }
    };
    fetchProduct();
  }, [productId]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const limited = acceptedFiles.slice(0, 3);
    setFiles(limited);
    const urls = limited.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 3,
  });

  // Handle intercept choices
  const handleResell = () => {
    setStepVisible(false);
    setTimeout(() => {
      setPhase("disposition");
      setStepVisible(true);
    }, 300);
  };

  const handleReturn = async () => {
    try {
      const userId = localStorage.getItem("slc_user_id") || "";
      await interceptReturn(userId, productId, "return");
      toast.success("Return initiated");
      router.push("/");
    } catch {
      toast.error("Failed to process return");
    }
  };

  // Handle AI analysis
  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setStepVisible(false);
    setTimeout(() => {
      setStep(2);
      setStepVisible(true);
      setAnalyzing(true);
    }, 300);

    // Progress animation
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 12;
      if (prog >= 95) {
        prog = 95;
        clearInterval(interval);
      }
      setProgress(Math.floor(prog));
    }, 400);

    try {
      const userId = localStorage.getItem("slc_user_id") || "";
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("return_reason", returnReason);
      formData.append("product_name", productName);
      formData.append("original_price", originalPrice.toString());
      formData.append("user_id", userId);

      const data: AnalysisResult = await analyzeDisposition(formData);

      clearInterval(interval);
      setProgress(100);
      setResult(data);

      setTimeout(() => {
        setStepVisible(false);
        setTimeout(() => {
          setStep(3);
          setAnalyzing(false);
          setStepVisible(true);
        }, 300);
      }, 800);
    } catch {
      clearInterval(interval);
      toast.error("Analysis failed. Please try again.");
      setStepVisible(false);
      setTimeout(() => {
        setStep(1);
        setAnalyzing(false);
        setStepVisible(true);
      }, 300);
    }
  };

  // Confetti animation
  useEffect(() => {
    if (step === 3 && result && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.parentElement?.offsetWidth || 800;
      canvas.height = canvas.parentElement?.offsetHeight || 600;

      const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 6.28,
      }));

      let animationId: number;
      let frameCount = 0;

      function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, 6.28);
          ctx.fill();
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 1;
          if (p.y > canvas.height) p.y = -10;
        });
        frameCount++;
        if (frameCount < 180) {
          animationId = requestAnimationFrame(draw);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      draw();

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
      };
    }
  }, [step, result]);

  const gaugeValue = result?.condition_score || 82;
  const gaugeDash = `${gaugeValue}, 100`;

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
          <div className="hidden md:flex items-center gap-10 text-base">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="/">
              Home
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="/">
              Marketplace
            </a>
            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">
              Dashboard
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
              💚 450 pts
            </span>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN0_LtLPNXakz2C1-RU-q--rI9QcmYxwn1J224QPZV13jnfFmNCB1xM_Y7xSKwdSynWcq3gwoeTFEtULN6GgOvgYtK9GVekXdXyOha5ePwVUv4Rfrxwp3e3Po-Fg1AHFkuNDBw9EU8_cTKSMIe5J4d3m_avecd7jLDGUmVoWpplfRZjeezsrSmOHFa8d7_5teqpckrkiQsnjLaUoUrFE5skkPZsEIL4WYcsYOqCXUBJHOqBcBZY84FrgZB3tOamTtFyGLgUmfiLKg"
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full border-2 border-primary-container object-cover"
            />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        {/* Phase 1: Intercept */}
        {phase === "intercept" && (
          <div
            className={`transition-all duration-300 ${
              stepVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Header */}
            <header className="mb-10 text-center">
              <h1 className="text-3xl font-bold leading-10 tracking-tight mb-3">
                Before You Return...
              </h1>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-base">
                We found a better way for your item to live on. Join our circular economy
                and get rewarded instantly.
              </p>
            </header>

            {/* Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {/* Resell Option */}
              <button
                onClick={handleResell}
                className="group relative overflow-hidden bg-primary-container text-on-primary-container p-10 rounded-xl shadow-lg border-2 border-primary transition-all active:scale-95 text-left flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <span className="text-4xl">🌱</span>
                  <span className="bg-on-primary-container text-primary-container text-sm font-semibold tracking-wide px-3 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold leading-8 mb-2">Resell Instead</h2>
                  <p className="text-on-primary-container/80 mb-4 text-base">
                    Give your item a second life. You&apos;ll receive instant credits plus the
                    full cash value once verified.
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase opacity-70 font-medium">Instant Credits</span>
                      <span className="text-2xl font-semibold">+150 pts</span>
                    </div>
                    <div className="w-px h-8 bg-on-primary-container/20" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase opacity-70 font-medium">Estimated Value</span>
                      <span className="text-2xl font-semibold">
                        {originalPrice > 0 ? formatPrice(originalPrice * 0.6) : "₹5,000"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Standard Return Option */}
              <button
                onClick={handleReturn}
                className="group bg-surface-container-low border border-outline-variant/30 p-10 rounded-xl text-left flex flex-col gap-6 transition-all hover:border-outline"
              >
                <span className="text-on-surface-variant text-4xl">↩️</span>
                <div>
                  <h2 className="text-2xl font-semibold leading-8 mb-2">Continue Return</h2>
                  <p className="text-on-surface-variant/70 mb-4 text-base">
                    Process a standard return for a refund. Note: Shipping fees may apply and
                    no ecosystem credits are awarded.
                  </p>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-on-surface-variant/50 font-medium">
                      Return Value
                    </span>
                    <span className="text-2xl font-semibold text-on-surface-variant">
                      {originalPrice > 0 ? formatPrice(originalPrice) : "₹8,995"}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Disposition */}
        {phase === "disposition" && (
          <div
            className={`transition-all duration-300 ${
              stepVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span
                    className={`text-sm font-semibold hidden md:inline ${
                      step >= s ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {s === 1 ? "Upload" : s === 2 ? "Analyzing" : "Result"}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-12 h-0.5 ${
                        step > s ? "bg-primary" : "bg-surface-container-highest"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
              <div className="glass-card rounded-xl p-10 shadow-lg border border-primary/10 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                  <span className="text-primary text-2xl">✨</span>
                  <h3 className="text-2xl font-semibold leading-8">AI Verification Engine</h3>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant hover:border-primary"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform">
                    <span className="text-3xl">☁️</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-1">Drag & drop photos</h4>
                  <p className="text-on-surface-variant text-base">
                    Upload up to 3 clear photos of the item (Front, Back, and Label)
                  </p>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
                    {previews.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden border border-outline-variant"
                      >
                        <Image
                          src={url}
                          alt={`Upload ${i + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Return Reason */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2 tracking-wide">
                    Return Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  >
                    {RETURN_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={files.length === 0}
                  className="mt-10 w-full py-6 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Analyze with AI ✨
                </button>
              </div>
            )}

            {/* Step 2: Analyzing */}
            {step === 2 && (
              <div className="glass-card rounded-xl p-16 shadow-lg text-center flex flex-col items-center max-w-3xl mx-auto">
                <div className="relative w-32 h-32 mb-10">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-primary text-4xl animate-pulse">🃏</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold leading-8 mb-1">
                  AI is analyzing your product...
                </h3>
                <p className="text-on-surface-variant mb-10 text-base">
                  Checking for wear, authenticity, and market demand.
                </p>
                <div className="w-full max-w-md h-2 bg-surface-container rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 text-sm font-bold text-primary">{progress}% complete</div>
              </div>
            )}

            {/* Step 3: Result */}
            {step === 3 && result && (
              <div className="relative glass-card rounded-xl overflow-hidden shadow-xl border border-primary/20 max-w-5xl mx-auto">
                {/* Confetti Canvas */}
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute top-0 left-0 w-full h-full z-10"
                />

                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-20">
                  {/* Left Column */}
                  <div>
                    {/* Verdict Badge */}
                    <div className="flex items-center gap-6 mb-10">
                      <span
                        className={`${getVerdictColor(result.verdict)} font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-base`}
                      >
                        <span>✓</span> VERDICT: {result.verdict.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="text-sm">✓</span>
                        <span className="text-sm font-semibold tracking-wide">
                          Authenticity Guaranteed
                        </span>
                      </div>
                    </div>

                    {/* Condition Gauge */}
                    <div className="mb-10">
                      <h4 className="text-xs uppercase font-bold text-on-surface-variant/60 mb-6 tracking-wider">
                        AI Condition Gauge
                      </h4>
                      <div className="flex items-center gap-10">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="3"
                              strokeDasharray="100, 100"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="url(#gaugeGradientResult)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={gaugeDash}
                              className="transition-all duration-[2s] ease-out"
                            />
                            <defs>
                              <linearGradient
                                id="gaugeGradientResult"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{gaugeValue}</span>
                            <span className="text-xs opacity-60">/100</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* Defect Chips */}
                          <div className="flex flex-wrap gap-2">
                            {result.defects.map((defect, i) => (
                              <span
                                key={i}
                                className="bg-surface-container-high px-3 py-1 rounded-full text-sm font-semibold tracking-wide flex items-center gap-1"
                              >
                                <span className="text-xs">ℹ️</span> {defect}
                              </span>
                            ))}
                          </div>
                          <p className="text-base text-on-surface-variant italic">
                            &ldquo;{result.reasoning}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Impact */}
                    <div className="space-y-6">
                      <h4 className="text-xs uppercase font-bold text-on-surface-variant/60 tracking-wider">
                        Sustainability Impact
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-secondary-container/30 p-6 rounded-xl">
                          <span className="text-secondary block mb-1 text-xl">🌿</span>
                          <div className="text-2xl font-semibold text-secondary">
                            {result.co2_saved} kg
                          </div>
                          <div className="text-xs text-secondary/80 font-medium">CO₂ Saved</div>
                        </div>
                        <div className="bg-tertiary-fixed/30 p-6 rounded-xl">
                          <span className="text-tertiary block mb-1 text-xl">💰</span>
                          <div className="text-2xl font-semibold text-tertiary">
                            {formatPrice(result.estimated_resale_value)}
                          </div>
                          <div className="text-xs text-tertiary/80 font-medium">Market Value</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Summary */}
                  <div className="flex flex-col justify-between">
                    <div className="bg-inverse-surface text-inverse-on-surface p-10 rounded-2xl shadow-xl">
                      <h3 className="text-2xl font-semibold leading-8 mb-6">
                        Summary & Confirmation
                      </h3>
                      <ul className="space-y-6 mb-10">
                        <li className="flex justify-between border-b border-surface-variant/20 pb-3">
                          <span>Immediate Credits</span>
                          <span className="font-bold text-primary-fixed-dim">
                            +{result.green_credits} pts
                          </span>
                        </li>
                        <li className="flex justify-between border-b border-surface-variant/20 pb-3">
                          <span>Resale Earnings</span>
                          <span className="font-bold">
                            {formatPrice(result.estimated_resale_value)}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Processing Fee</span>
                          <span className="text-surface-variant">FREE</span>
                        </li>
                      </ul>

                      {result.verdict === "Resell" && result.listing_id && (
                        <div className="bg-surface-variant/10 p-6 rounded-xl mb-10">
                          <p className="text-sm font-semibold tracking-wide">
                            🎉 Your item has been listed on the marketplace!
                          </p>
                        </div>
                      )}

                      <div className="bg-surface-variant/10 p-6 rounded-xl mb-10">
                        <p className="text-sm font-semibold tracking-wide">
                          By clicking below, your return will be converted to a{" "}
                          {result.verdict}. We&apos;ll send you a prepaid label instantly.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          toast.success(`${result.verdict} confirmed! Credits awarded 🎉`);
                          router.push("/");
                        }}
                        className="w-full py-6 bg-primary-fixed text-on-primary-fixed rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all mb-6"
                      >
                        Confirm {result.verdict} & Get Credits
                      </button>

                      {result.verdict === "Resell" && (
                        <button
                          onClick={() => router.push("/")}
                          className="w-full py-6 text-surface-variant hover:text-white transition-colors text-sm font-semibold"
                        >
                          View on Marketplace →
                        </button>
                      )}

                      <button
                        onClick={() => router.push("/")}
                        className="w-full py-3 text-surface-variant hover:text-white transition-colors text-sm font-semibold"
                      >
                        Changed my mind, back to home
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low border-t border-outline-variant/20">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold text-primary">SecondLife</div>
          <p className="text-sm font-semibold text-on-surface-variant max-w-sm">
            © 2024 SecondLife by Amazon. Circular economy for a greener planet.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-secondary text-sm font-semibold hover:underline transition-all" href="#">
            Sustainability Report
          </a>
          <a className="text-secondary text-sm font-semibold hover:underline transition-all" href="#">
            How it Works
          </a>
          <a className="text-secondary text-sm font-semibold hover:underline transition-all" href="#">
            Terms of Service
          </a>
          <a className="text-secondary text-sm font-semibold hover:underline transition-all" href="#">
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
}
