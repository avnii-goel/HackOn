"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id?: string;
  name: string;
  category: string;
  image_url: string | null;
  price?: number;
  return_rate?: number;
  refurb_price?: number | null;
  asking_price?: number;
  condition_label?: string;
  ai_grade?: string;
  description?: string;
  listing_id?: string;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isMarketplace?: boolean;
  isExpanded?: boolean;
  onCollapse?: () => void;
  onPurchase?: () => void;
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  clothing: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  home: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  books: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  sports: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
};

export default function ProductCard({ 
  product, 
  onClick, 
  isMarketplace = false,
  isExpanded = false,
  onCollapse,
  onPurchase
}: ProductCardProps) {
  const router = useRouter();

  const imgUrl = (product.image_url && !product.image_url.includes("placeholder")) 
    ? product.image_url 
    : PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES.electronics;

  const displayPrice = isMarketplace ? product.asking_price : product.price;

  // Render Life Path Indicator
  const renderLifePath = () => (
    <div className="mt-4 mb-1 border-t border-slc-divider pt-3">
      <div className="life-path justify-between px-1">
        <div className="flex flex-col items-center gap-1">
          <div className="life-path-dot bg-slc-smoke text-slc-steel rounded-full">📦</div>
          <span className="text-[9px] font-bold text-slc-steel uppercase">Return</span>
        </div>
        <div className="life-path-line" />
        <div className="flex flex-col items-center gap-1">
          <div className="life-path-dot bg-slc-amber-light text-slc-amber rounded-full">🤖</div>
          <span className="text-[9px] font-bold text-slc-steel uppercase">Grade</span>
        </div>
        <div className="life-path-line" />
        <div className="flex flex-col items-center gap-1">
          <div className="life-path-dot bg-blue-50 text-blue-500 rounded-full">✅</div>
          <span className="text-[9px] font-bold text-slc-steel uppercase">Route</span>
        </div>
        <div className="life-path-line" />
        <div className="flex flex-col items-center gap-1">
          <div className="life-path-dot bg-slc-leaf-light text-slc-leaf rounded-full">💚</div>
          <span className="text-[9px] font-bold text-slc-steel uppercase">Earn</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slc-divider overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col relative h-full">
      {/* Left Hover Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slc-leaf opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slc-smoke">
        <Image 
          src={imgUrl} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* Marketplace Badges */}
        {isMarketplace && product.condition_label && (
          <div className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-bold rounded-md border bg-white/95 ${
            product.condition_label.includes("New") ? "border-slc-leaf text-slc-leaf" :
            product.condition_label.includes("Good") ? "border-slc-sky text-slc-sky" :
            "border-slc-amber text-slc-amber"
          }`}>
            {product.condition_label.includes("New") ? "✨ " : product.condition_label.includes("Good") ? "✅ " : "😐 "}
            {product.condition_label}
          </div>
        )}

        {isMarketplace && (
          <div className="absolute top-3 right-3 bg-slc-ink/80 text-white text-xs px-2 py-0.5 rounded-md font-semibold">
            🤖 AI Verified
          </div>
        )}

        {/* Catalog Risk Badge */}
        {!isMarketplace && product.return_rate !== undefined && (
          <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            product.return_rate > 20 ? "bg-slc-red" : product.return_rate > 10 ? "bg-slc-amber" : "bg-slc-leaf"
          }`} />
        )}
      </div>
      
      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-slc-steel uppercase tracking-wide font-semibold mb-1">
          {product.category}
        </span>
        <h3 className="text-base font-bold text-slc-ink leading-snug line-clamp-2 mb-2 min-h-[44px]">
          {product.name}
        </h3>

        {/* Price Row */}
        {displayPrice !== undefined && (
          <div className="mb-2">
            {!isMarketplace && product.refurb_price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-slc-steel text-sm line-through">₹{displayPrice.toLocaleString('en-IN')}</span>
                <span className="text-xl font-bold text-slc-leaf font-mono">₹{product.refurb_price.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slc-red font-mono">₹{displayPrice.toLocaleString('en-IN')}</span>
                {isMarketplace && <span className="text-xs text-slc-leaf font-semibold">Free delivery</span>}
              </div>
            )}
          </div>
        )}

        {/* Stars */}
        {!isMarketplace && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-slc-amber text-sm">★★★★☆</span>
            <span className="text-slc-ink text-sm font-bold ml-1">4.2</span>
            <span className="text-slc-steel text-sm">(438)</span>
          </div>
        )}

        {/* AI Grade for Marketplace */}
        {isMarketplace && product.ai_grade && (
          <div className="mb-2">
            <span className="bg-slc-leaf-light text-slc-leaf text-xs font-semibold px-2 py-0.5 rounded">
              AI Grade: {product.ai_grade}
            </span>
          </div>
        )}

        {/* Seller Info */}
        {isMarketplace && (
          <div className="flex items-center gap-1.5 mb-2 mt-1">
            <div className="w-3.5 h-3.5 bg-slc-leaf rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>
            <span className="text-xs text-slc-steel font-medium">SecondLife Verified Seller</span>
          </div>
        )}

        <div className="mt-auto">
          {renderLifePath()}

          {/* Expanded details (Marketplace only) */}
          {isMarketplace && isExpanded && product.description && (
            <div className="py-3 text-sm text-slc-steel line-clamp-3 mb-2 border-t border-slc-divider">
              {product.description}
            </div>
          )}

          {/* CTA Row */}
          {isMarketplace ? (
            <div className="border-t border-slc-divider pt-3 flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); if (isExpanded) { onCollapse?.(); } else { onClick(); } }}
                className="flex-1 border border-slc-divider text-slc-ink text-sm font-semibold py-2.5 rounded-lg hover:bg-slc-cloud transition-colors"
              >
                {isExpanded ? "Hide" : "View"}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onPurchase?.(); }}
                className="flex-[2] bg-slc-amber text-slc-ink font-semibold py-2.5 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <div className="border-t border-slc-divider pt-3 flex gap-2">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (product.listing_id) {
                    router.push(`/marketplace/${product.listing_id}`);
                  } else if (isExpanded) {
                    onCollapse?.();
                  } else {
                    onClick(); 
                  }
                }}
                className="flex-1 bg-slc-amber text-slc-ink text-sm font-semibold py-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                View Item
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); router.push(`/return/${product.id}`); }}
                className="flex-1 bg-slc-leaf text-white text-sm font-semibold py-2 rounded-lg hover:bg-slc-leaf-dark transition-colors"
              >
                Quick Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
