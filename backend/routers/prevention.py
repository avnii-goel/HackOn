from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import supabase_service, groq_service

router = APIRouter()


class InterceptRequest(BaseModel):
    user_id: str
    product_id: str
    choice: str


@router.get("/risk/{product_id}")
async def get_risk(product_id: str):
    try:
        product = supabase_service.get_product(product_id)

        if not product:
            products = supabase_service.get_all_products()
            product = products[0] if products else None

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        risk = groq_service.get_return_risk(
            product_name=product["name"],
            category=product["category"],
            return_rate=product["return_rate"] or 10,
            common_reasons=product["common_return_reasons"] or [],
        )

        return {
            "product_id": product_id,
            "product_name": product["name"],
            "return_rate": product["return_rate"] or 10,
            "risk_level": "high" if (product["return_rate"] or 0) > 25 else "medium" if (product["return_rate"] or 0) > 10 else "low",
            "risk_score": risk["risk_score"],
            "primary_reason": risk["primary_reason"],
            "suggestion": risk["suggestion"],
            "prevention_tip": risk["prevention_tip"],
            "common_reasons": product["common_return_reasons"] or [],
            "refurb_available": product["refurb_available"],
            "refurb_price": product["refurb_price"],
            "category": product["category"],
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
