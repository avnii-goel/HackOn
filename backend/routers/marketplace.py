from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import json

from services import supabase_service

router = APIRouter()


class PurchaseRequest(BaseModel):
    buyer_id: str


@router.get("/listings")
async def get_listings(
    category: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    condition_min: Optional[int] = Query(None),
):
    try:
        listings = supabase_service.get_listings(category=category, status="available")
        if condition_min is not None:
            listings = [l for l in listings if l.get("condition_score", 0) >= condition_min]
        if max_price is not None:
            listings = [l for l in listings if l.get("asking_price", l.get("suggested_price", 0)) <= max_price]
        
        normalized = []
        for l in listings:
            extra = {}
            if l.get("ai_description") and l["ai_description"].startswith("{"):
                try:
                    extra = json.loads(l["ai_description"])
                except:
                    pass
            
            normalized.append({
                **l,
                "asking_price": l.get("asking_price") or l.get("suggested_price", 0),
                "condition_label": extra.get("condition_label", "Good"),
                "ai_grade": extra.get("ai_grade", "Verified"),
                "description": extra.get("description", l.get("ai_description", "")),
                "seller_note": extra.get("seller_note", ""),
                "green_credits_on_purchase": extra.get("green_credits_on_purchase", 150),
                "is_available": l.get("status", "available") == "available",
                "product": {
                    "name": l.get("product_name", l.get("name", "Unknown Product")),
                    "category": l.get("category", "electronics"),
                    "image_url": l.get("image_url", None),
                }
            })
        return normalized
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    try:
        l = supabase_service.get_listing(listing_id)
        if not l:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        extra = {}
        if l.get("ai_description") and l["ai_description"].startswith("{"):
            try:
                extra = json.loads(l["ai_description"])
            except:
                pass
                
        return {
            **l,
            "asking_price": l.get("asking_price") or l.get("suggested_price", 0),
            "condition_label": extra.get("condition_label", "Good"),
            "ai_grade": extra.get("ai_grade", "Verified"),
            "description": extra.get("description", l.get("ai_description", "")),
            "seller_note": extra.get("seller_note", ""),
            "green_credits_on_purchase": extra.get("green_credits_on_purchase", 150),
            "is_available": l.get("status", "available") == "available",
            "product": {
                "name": l.get("product_name", l.get("name", "Unknown Product")),
                "category": l.get("category", "electronics"),
                "image_url": l.get("image_url", None),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/purchase/{listing_id}")
async def purchase_listing(listing_id: str, request: PurchaseRequest):
    try:
        listing = supabase_service.get_listing(listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        supabase_service.update_listing_status(listing_id, "sold")

        supabase_service.update_user_credits(request.buyer_id, 150, listing.get("co2_saved", 0))

        supabase_service.add_transaction({
            "user_id": request.buyer_id,
            "action_type": "purchase",
            "credits_earned": 150,
            "listing_id": listing_id,
        })

        return {
            "success": True,
            "credits_earned": 150,
            "co2_saved": listing.get("co2_saved", 0),
            "product_name": listing.get("product_name"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products")
async def get_products():
    try:
        return supabase_service.get_all_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
