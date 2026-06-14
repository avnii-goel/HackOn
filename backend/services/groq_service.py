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
            "You are an AI product condition analyzer for Amazon's Second Life Commerce platform. "
            "Analyze the product image and return a JSON response only, no other text."
        )

        user_prompt = (
            f"Analyze this product image. Return reason: {return_reason}. Product: {product_name}.\n\n"
            "Return ONLY this JSON:\n"
            "{\n"
            "  \"condition_score\": <integer 0-100>,\n"
            "  \"defects\": <list of strings describing visible issues, max 4>,\n"
            "  \"verdict\": <exactly one of: Resell, Refurbish, Donate, Recycle>,\n"
            "  \"reasoning\": <2 sentence explanation>,\n"
            "  \"estimated_resale_value\": <float in INR>,\n"
            "  \"co2_saved\": <float kg>,\n"
            "  \"green_credits\": <integer>\n"
            "}\n\n"
            "Verdict rules: 80-100=Resell, 50-79=Refurbish, 20-49=Donate, 0-19=Recycle\n"
            "Green credits: Resell=200, Refurbish=150, Donate=100, Recycle=50\n"
            "CO2 saved: Resell=2.5, Refurbish=1.8, Donate=1.2, Recycle=0.8"
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
            temperature=0.3,
            max_tokens=512,
        )

        content = response.choices[0].message.content.strip()

        # Try to extract JSON from the response
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        return result

    except (json.JSONDecodeError, IndexError, KeyError):
        return {
            "condition_score": 75,
            "defects": ["Unable to fully analyze image"],
            "verdict": "Resell",
            "reasoning": "AI analysis could not parse the response. Defaulting to Resell based on general condition.",
            "estimated_resale_value": 0.0,
            "co2_saved": 2.5,
            "green_credits": 200,
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
