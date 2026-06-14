from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

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
            listings = [l for l in listings if l.get("suggested_price", 0) <= max_price]

        return listings

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    try:
        listing = supabase_service.get_listing(listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        return listing
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
