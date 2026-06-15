import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise Exception("GROQ_API_KEY must be set in .env")

client = Groq(api_key=GROQ_API_KEY)


def analyze_product_image(image_base64: str, return_reason: str, product_name: str) -> dict:
    try:
        system_prompt = (
            "You are a strict AI product condition analyzer. "
            "You MUST analyze what you actually SEE in the image. "
            "If the image shows a different product than what is named, analyze what you actually see. "
            "Return only valid JSON, no other text."
        )

        user_prompt = (
            f"Analyze this product image carefully.\n"
            f"User says this is: {product_name}\n"
            f"Additional context: {return_reason}\n\n"
            "First identify what product you actually see in the image.\n"
            "Then analyze its condition based purely on visual inspection.\n\n"
            "Return ONLY this JSON:\n"
            "{\n"
            "  \"detected_product\": <what you actually see in the image>,\n"
            "  \"condition_score\": <integer 0-100 based on visual condition>,\n"
            "  \"defects\": <list of visually detected issues, max 4, empty list if none>,\n"
            "  \"verdict\": <Resell if score>=80, Refurbish if 50-79, Donate if 20-49, Recycle if below 20>,\n"
            "  \"reasoning\": <2 sentences about what you visually see and why this verdict>,\n"
            "  \"estimated_resale_value\": <realistic INR resale value for detected product in this condition. Base on actual Indian market prices. High value items like laptops/phones get higher values, low value items like books/bottles get lower values>,\n"
            "  \"co2_saved\": <CO2 in kg based on item weight and category. Electronics 2-5kg, clothing 1-3kg, books 0.3-0.8kg, small items 0.2-0.5kg>,\n"
            "  \"green_credits\": <credits proportional to item value. Formula: min(500, max(50, estimated_resale_value / 100)). Round to nearest 50>\n"
            "}\n\n"
            "IMPORTANT: Be realistic. A bottle is worth ₹50-200. A phone is worth ₹5000-30000. "
            "Credits must reflect actual item value, not always 200."
        )

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                            },
                        },
                        {
                            "type": "text",
                            "text": user_prompt,
                        },
                    ],
                },
            ],
            temperature=0.2,
            max_tokens=600,
        )

        content = response.choices[0].message.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)

        # Validate and fix credits formula if AI ignored it
        if result.get("estimated_resale_value", 0) > 0:
            calculated_credits = min(500, max(50, int(result["estimated_resale_value"] / 100)))
            # Round to nearest 50
            result["green_credits"] = round(calculated_credits / 50) * 50

        return result

    except (json.JSONDecodeError, IndexError, KeyError):
        return {
            "detected_product": product_name,
            "condition_score": 70,
            "defects": ["Could not fully analyze image"],
            "verdict": "Refurbish",
            "reasoning": "AI could not parse the image clearly. Manual inspection recommended.",
            "estimated_resale_value": 500.0,
            "co2_saved": 1.0,
            "green_credits": 50,
        }
    except Exception as e:
        raise Exception(f"Failed to analyze product image: {str(e)}")


def get_return_risk(
    product_name: str,
    category: str,
    return_rate: int,
    common_reasons: list,
    user_past_returns: list = None,   # NEW param
    user_profile: dict = None         # NEW param
) -> dict:
    try:
        system_prompt = (
            "You are an Amazon AI conversion optimization agent specializing in "
            "return prevention. Your job is to protect the customer from making "
            "a purchase they will regret, and redirect them to a better option. "
            "Return only valid JSON, no other text."
        )

        user_context = ""
        if user_past_returns and len(user_past_returns) > 0:
            user_context = (
                f"This specific customer has previously returned: {user_past_returns}. "
                "Use this to make your warning deeply personal — reference their actual history."
            )
        else:
            user_context = (
                "No specific return history available for this customer. "
                "Give general but compelling advice based on product patterns."
            )

        user_prompt = (
            f"Product: {product_name}\n"
            f"Category: {category}\n"
            f"Historical return rate: {return_rate}%\n"
            f"Most common return reasons: {common_reasons}\n"
            f"Customer context: {user_context}\n\n"
            "Based on this data, generate a personalised pre-purchase intercept.\n\n"
            "Return ONLY this JSON:\n"
            "{\n"
            "  \"risk_score\": <int 0-100, based on return_rate and pattern severity>,\n"
            "  \"risk_level\": <\"low\" if risk_score<30, \"medium\" if 30-60, \"high\" if >60>,\n"
            "  \"primary_reason\": <the single most likely reason THIS customer will return>,\n"
            "  \"personalised_warning\": <1 sentence, direct and specific. If user has return history, reference it explicitly. E.g. 'You previously returned Nike shoes for being too tight — this model also runs small.'. If no history: 'Based on buyer patterns, this item frequently disappoints on {primary_reason}.' Max 20 words.>,\n"
            "  \"size_recommendation\": <ONLY for clothing/footwear: recommended size adjustment like 'Order one size up'. Empty string for other categories.>,\n"
            "  \"prevention_tip\": <one sharp actionable sentence, different from personalised_warning>,\n"
            "  \"intercept_headline\": <5-8 word punchy headline for the banner. E.g. 'This shoe runs small — here is your fix.' or 'High return risk detected for your profile.'>,\n"
            "  \"suggested_action\": <\"buy_refurb\" if refurb would solve the problem, \"check_size\" if sizing issue, \"read_reviews\" if expectation mismatch, \"proceed\" if low risk>\n"
            "}"
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=400,
        )

        content = response.choices[0].message.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)

        # Ensure risk_level is always present and consistent
        score = result.get("risk_score", return_rate)
        if "risk_level" not in result:
            result["risk_level"] = "high" if score > 60 else "medium" if score > 30 else "low"

        return result

    except (json.JSONDecodeError, IndexError, KeyError):
        return {
            "risk_score": return_rate,
            "risk_level": "high" if return_rate > 25 else "medium" if return_rate > 10 else "low",
            "primary_reason": common_reasons[0] if common_reasons else "Unmet expectations",
            "personalised_warning": f"{return_rate}% of buyers return this item — read the reviews carefully before purchasing.",
            "size_recommendation": "Consider ordering one size up." if category == "clothing" else "",
            "prevention_tip": "Check the size guide and recent reviews before adding to cart.",
            "intercept_headline": "High return risk detected for this product.",
            "suggested_action": "check_size" if category == "clothing" else "read_reviews",
        }
    except Exception as e:
        raise Exception(f"Failed to get return risk: {str(e)}")


def generate_listing_description(product_name: str, condition_score: int, defects: list, verdict: str) -> str:
    try:
        prompt = (
            f"Write a 2-sentence marketplace listing for a second-hand {product_name}. "
            f"Condition score: {condition_score}/100. Known issues: {defects}. Grade: {verdict}. "
            "Be honest but positive. Return only the description text."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=128,
        )

        content = response.choices[0].message.content.strip()
        return content

    except Exception:
        return "Quality-checked second-life product. Minor wear consistent with use."
