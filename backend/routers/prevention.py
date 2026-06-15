from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services import supabase_service, groq_service

router = APIRouter()


class InterceptRequest(BaseModel):
    user_id: str
    product_id: str
    choice: str


@router.get("/risk/{product_id}")
async def get_risk(product_id: str, user_id: Optional[str] = Query(None)):
    try:
        product = supabase_service.get_product(product_id)

        if not product:
            products = supabase_service.get_all_products()
            product = products[0] if products else None

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Mock user past returns based on user_id
        # In production this would query a user_returns table
        USER_PAST_RETURNS = {
            "a1b2c3d4-e5f6-7890-abcd-ef1234567890": [
                "Nike Air Max (returned: size too small)",
                "Boat headphones (returned: sound quality)",
            ],
            "b2c3d4e5-f6a7-8901-bcde-f12345678901": [
                "Levi's jeans (returned: color mismatch)",
                "Prestige cooker (returned: wrong size delivered)",
            ],
        }
        past_returns = USER_PAST_RETURNS.get(user_id, []) if user_id else []

        risk = groq_service.get_return_risk(
            product_name=product.get("name", ""),
            category=product.get("category", ""),
            return_rate=product.get("return_rate", 0),
            common_reasons=product.get("common_return_reasons", []),
            user_past_returns=past_returns,
            user_profile={"user_id": user_id},
        )

        return {
            "product_id": product_id,
            "product_name": product.get("name", ""),
            "return_rate": product.get("return_rate", 10),
            "risk_level": risk.get("risk_level", "medium"),
            "risk_score": risk.get("risk_score", 0),
            "primary_reason": risk.get("primary_reason", ""),
            "suggestion": risk.get("suggestion", ""),
            "prevention_tip": risk.get("prevention_tip", ""),
            "common_reasons": product.get("common_return_reasons", []),
            "refurb_available": product.get("refurb_available", False),
            "refurb_price": product.get("refurb_price", None),
            "category": product.get("category", ""),
            "personalised_warning": risk.get("personalised_warning", ""),
            "size_recommendation": risk.get("size_recommendation", ""),
            "intercept_headline": risk.get("intercept_headline", ""),
            "suggested_action": risk.get("suggested_action", ""),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/intercept")
async def intercept(request: InterceptRequest):
    try:
        if request.choice == "resell":
            return {
                "action": "resell",
                "redirect": f"/return/{request.product_id}",
            }

        if request.choice == "return":
            supabase_service.add_transaction({
                "user_id": request.user_id,
                "action_type": "normal_return",
                "credits_earned": 0,
            })
            return {
                "action": "normal_return",
                "message": "Your return has been initiated",
            }

        raise HTTPException(status_code=400, detail="Invalid choice. Must be 'resell' or 'return'.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
