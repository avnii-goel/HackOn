"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Bot, CheckCircle, Heart, Sparkles, Activity, ClipboardList } from 'lucide-react';

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
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
      <div className="life-path-dot bg-slc-smoke text-slc-steel rounded-full p-1" title="Used"><Package className="w-3.5 h-3.5" /></div>
      <div className="w-px h-3 bg-white/50 mx-auto" />
      <div className="life-path-dot bg-slc-amber-light text-slc-amber rounded-full p-1" title="AI Inspected"><Bot className="w-3.5 h-3.5" /></div>
      <div className="w-px h-3 bg-white/50 mx-auto" />
      <div className="life-path-dot bg-blue-50 text-blue-500 rounded-full p-1" title="Verified"><CheckCircle className="w-3.5 h-3.5" /></div>
      <div className="w-px h-3 bg-white/50 mx-auto" />
      <div className="life-path-dot bg-slc-leaf-light text-slc-leaf rounded-full p-1" title="Ready"><Heart className="w-3.5 h-3.5" /></div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slc-divider overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col relative h-full">

      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slc-smoke">
        {renderLifePath()}
        <Image 
          src={imgUrl} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* Marketplace Badges */}
        {isMarketplace && product.condition_label && (
          <div className="absolute top-3 right-3">
             <span className="bg-slc-cloud text-slc-ink px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center">
              {product.condition_label.includes("New") ? <Sparkles className="w-3 h-3 inline mr-1" /> : product.condition_label.includes("Good") ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <Activity className="w-3 h-3 inline mr-1" />}
              {product.condition_label}
            </span>
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

        {/* AI Grade for Marketplace */}
        {isMarketplace && product.ai_grade && (
          <div className="mb-2">
            <span className="bg-slc-amber-light text-slc-amber-dark px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center w-fit">
              <Bot className="w-3 h-3 mr-1" /> AI Grade: {product.ai_grade}
            </span>
          </div>
        )}

        <div className="mt-auto">
          {/* CTA Row */}
          {isMarketplace ? (
            <div>
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
              <Link 
                href={`/verify/${product.listing_id || product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full mt-2 bg-slc-cloud hover:bg-slc-smoke text-slc-ink font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center border border-slc-divider"
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> View Health Card
              </Link>
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
