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


def get_return_risk(product_name: str, category: str, return_rate: int, common_reasons: list) -> dict:
    try:
        system_prompt = "You are a return risk analyzer. Return only valid JSON, no other text."

        user_prompt = (
            f"Product: {product_name}, Category: {category}, "
            f"Historical return rate: {return_rate}%, "
            f"Common return reasons: {common_reasons}. "
            "Return ONLY this JSON:\n"
            "{\n"
            "  \"risk_score\": <int 0-100>,\n"
            "  \"primary_reason\": <string>,\n"
            "  \"suggestion\": <string, buying tip>,\n"
            "  \"prevention_tip\": <string, one actionable sentence>\n"
            "}"
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=256,
        )

        content = response.choices[0].message.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        return result

    except (json.JSONDecodeError, IndexError, KeyError):
        return {
            "risk_score": return_rate,
            "primary_reason": common_reasons[0] if common_reasons else "Unknown",
            "suggestion": "Check size guide",
            "prevention_tip": "Read reviews carefully",
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
