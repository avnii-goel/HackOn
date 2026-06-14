import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List

from services import cloudinary_service, groq_service, supabase_service

router = APIRouter()


@router.post("/analyze")
async def analyze_disposition(
    # files: List[UploadFile] = File(..., max_length=3),
    files: List[UploadFile] = File(...),
    return_reason: str = Form(...),
    product_name: str = Form(...),
    original_price: float = Form(...),
    user_id: str = Form(...),
):
    try:
        # 1. Upload each image to Cloudinary
        image_urls = []
        first_image_bytes = None

        for i, file in enumerate(files[:3]):
            file_bytes = await file.read()
            if i == 0:
                first_image_bytes = file_bytes
            filename = f"{product_name.replace(' ', '_')}_{i}"
            url = cloudinary_service.upload_image(file_bytes, filename)
            image_urls.append(url)

        # 2. Convert first image to base64
        image_base64 = base64.b64encode(first_image_bytes).decode("utf-8")

        # 3. Analyze product image with Groq
        analysis = groq_service.analyze_product_image(image_base64, return_reason, product_name)

        # 4. Generate listing description
        ai_description = groq_service.generate_listing_description(
            product_name,
            analysis["condition_score"],
            analysis["defects"],
            analysis["verdict"],
        )

        # 5. Create listing if verdict is Resell or Refurbish
        listing_id = None
        if analysis["verdict"] in ("Resell", "Refurbish"):
            listing_data = {
                "seller_id": user_id,
                "product_name": product_name,
                "category": "general",
                "condition_score": analysis["condition_score"],
                "verdict": analysis["verdict"],
                "ai_description": ai_description,
                "suggested_price": analysis["estimated_resale_value"],
                "original_price": original_price,
                "co2_saved": analysis["co2_saved"],
                "image_url": image_urls[0],
                "status": "available",
            }
            listing = supabase_service.create_listing(listing_data)
            listing_id = listing["id"]

        # 6. Update user credits
        supabase_service.update_user_credits(
            user_id,
            analysis["green_credits"],
            analysis["co2_saved"],
        )

        # 7. Add transaction
        transaction_data = {
            "user_id": user_id,
            "action_type": f"{analysis['verdict'].lower()}_submitted",
            "credits_earned": analysis["green_credits"],
            "listing_id": listing_id,
        }
        supabase_service.add_transaction(transaction_data)

        # 8. Return full response
        return {
            "condition_score": analysis["condition_score"],
            "defects": analysis["defects"],
            "verdict": analysis["verdict"],
            "reasoning": analysis["reasoning"],
            "estimated_resale_value": analysis["estimated_resale_value"],
            "co2_saved": analysis["co2_saved"],
            "green_credits": analysis["green_credits"],
            "ai_description": ai_description,
            "listing_id": listing_id,
            "image_urls": image_urls,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
