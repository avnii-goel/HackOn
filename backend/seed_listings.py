"""
Run once: python seed_listings.py
Inserts 15 new second-life listings across all categories.
"""
import os, sys
sys.path.append(os.path.dirname(__file__))
from services.supabase_service import supabase

LISTINGS = [
  # ── ELECTRONICS ──────────────────────────────────────────
  {
    "product_name": "Samsung Galaxy S23 Ultra",
    "category": "electronics",
    "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
    "asking_price": 62000,
    "original_price": 124999,
    "condition_label": "Like New",
    "ai_grade": "Pristine",
    "condition_score": 96,
    "description": "Purchased in Jan 2024, used for 3 months. Comes with original box, charger, and S-Pen. Zero scratches — kept in case always. Battery health 99%.",
    "status": "available",
    "co2_saved": 4.2,
    "seller_note": "Upgrading to S24. No issues whatsoever.",
    "green_credits_on_purchase": 200,
  },
  {
    "product_name": "Apple MacBook Air M2 13\"",
    "category": "electronics",
    "image_url": "https://images.unsplash.com/photo-1611186871525-b46dc9b5a9a8?w=600&q=80",
    "asking_price": 78000,
    "original_price": 114900,
    "condition_label": "Good",
    "ai_grade": "Minor Wear",
    "condition_score": 84,
    "description": "Used for college coursework for 1 year. Minor keyboard wear on common keys. Screen pristine. Battery cycles: 187. Comes with original charger.",
    "status": "available",
    "co2_saved": 6.1,
    "seller_note": "Got a work laptop, this one now unused.",
    "green_credits_on_purchase": 200,
  },
  {
    "product_name": "Sony PlayStation 5 Disc Edition",
    "category": "electronics",
    "image_url": "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80",
    "asking_price": 38000,
    "original_price": 54990,
    "condition_label": "Good",
    "ai_grade": "Excellent Functional",
    "condition_score": 88,
    "description": "Bought during Diwali sale. Moving abroad, cannot carry. Includes 2 controllers, HDMI cable, and stand. Works flawlessly. No disc scratches.",
    "status": "available",
    "co2_saved": 5.3,
    "seller_note": "Relocating internationally. Price is firm.",
    "green_credits_on_purchase": 200,
  },

  # ── CLOTHING ─────────────────────────────────────────────
  {
    "product_name": "Levi's 511 Slim Fit Jeans — W32 L30",
    "category": "clothing",
    "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    "asking_price": 1800,
    "original_price": 3999,
    "condition_label": "Like New",
    "ai_grade": "Flawless",
    "condition_score": 95,
    "description": "Worn twice. Washed once, cold water. No fading, no fraying. Dark indigo colour intact. Perfect for someone W32 L30.",
    "status": "available",
    "co2_saved": 1.8,
    "seller_note": "Wrong size — ordered online without trying.",
    "green_credits_on_purchase": 150,
  },
  {
    "product_name": "Adidas Ultraboost 22 Running Shoes — UK9",
    "category": "clothing",
    "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600&q=80",
    "asking_price": 5500,
    "original_price": 14999,
    "condition_label": "Good",
    "ai_grade": "Light Use",
    "condition_score": 82,
    "description": "Used for 3 months of light gym workouts. Soles show minimal wear. Upper is clean. Boost cushioning still responsive. Box not included.",
    "status": "available",
    "co2_saved": 2.1,
    "seller_note": "Switched to barefoot training. Great shoes, wrong sport for me.",
    "green_credits_on_purchase": 150,
  },
  {
    "product_name": "Fabindia Linen Kurta Set — XL",
    "category": "clothing",
    "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4b4869?w=600&q=80",
    "asking_price": 1200,
    "original_price": 3200,
    "condition_label": "Like New",
    "ai_grade": "Pristine",
    "condition_score": 94,
    "description": "Gifted by relative, never worn. XL size. Off-white linen kurta + palazzo set. Tags still attached. Perfect for weddings or office ethnic days.",
    "status": "available",
    "co2_saved": 1.4,
    "seller_note": "Wrong size gift. Never altered.",
    "green_credits_on_purchase": 150,
  },

  # ── HOME & KITCHEN ────────────────────────────────────────
  {
    "product_name": "Dyson V12 Detect Slim Cordless Vacuum",
    "category": "home",
    "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "asking_price": 22000,
    "original_price": 52900,
    "condition_label": "Good",
    "ai_grade": "Well Maintained",
    "condition_score": 86,
    "description": "Used for 8 months in a 2BHK flat. All attachments included. Filter washed monthly. Suction power full. Minor scuff on body from storage. Genuine Dyson.",
    "status": "available",
    "co2_saved": 3.9,
    "seller_note": "Maid broke her wrist, no longer needed at this scale.",
    "green_credits_on_purchase": 200,
  },
  {
    "product_name": "Philips Air Fryer HD9200 — 4.1L",
    "category": "home",
    "image_url": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
    "asking_price": 4200,
    "original_price": 8995,
    "condition_label": "Good",
    "ai_grade": "Clean, Functional",
    "condition_score": 80,
    "description": "Used weekly for 6 months. Basket washed after every use. No burn marks. Temperature dial works perfectly. Cord intact. Original manual included.",
    "status": "available",
    "co2_saved": 2.2,
    "seller_note": "Gifting a bigger model to parents. This one free to good home.",
    "green_credits_on_purchase": 150,
  },
  {
    "product_name": "IKEA KALLAX 4-Cube Shelf Unit — White",
    "category": "home",
    "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "asking_price": 2800,
    "original_price": 5999,
    "condition_label": "Fair",
    "ai_grade": "Visible Use",
    "condition_score": 71,
    "description": "2 years old. Small chip on bottom-right corner (shown in photos). All joints tight. Comes disassembled with original hardware. Self-pickup from Gurgaon preferred.",
    "status": "available",
    "co2_saved": 1.6,
    "seller_note": "Redecorating. Price negotiable for quick pickup.",
    "green_credits_on_purchase": 100,
  },

  # ── BOOKS ─────────────────────────────────────────────────
  {
    "product_name": "The Psychology of Money — Morgan Housel",
    "category": "books",
    "image_url": "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80",
    "asking_price": 180,
    "original_price": 399,
    "condition_label": "Good",
    "ai_grade": "Read Once",
    "condition_score": 85,
    "description": "Read cover-to-cover once. No highlights or annotations. Spine not cracked. A couple of very light dog-ears in Part 2. Dust jacket intact.",
    "status": "available",
    "co2_saved": 0.4,
    "seller_note": "Moving to Kindle. This deserves a reader who will treasure it.",
    "green_credits_on_purchase": 50,
  },
  {
    "product_name": "GATE 2025 — CSE Complete Guide (Made Easy)",
    "category": "books",
    "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    "asking_price": 550,
    "original_price": 1450,
    "condition_label": "Fair",
    "ai_grade": "Annotated",
    "condition_score": 68,
    "description": "Heavily used for GATE prep. Pencil marks throughout — all erasable. All pages present. Binding strong. Includes handwritten formula sheets tucked inside (bonus!).",
    "status": "available",
    "co2_saved": 0.5,
    "seller_note": "Cleared GATE 2025 with AIR 312. Passing this forward.",
    "green_credits_on_purchase": 50,
  },
  {
    "product_name": "Deep Work + So Good They Can't Ignore You — Cal Newport (Set of 2)",
    "category": "books",
    "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "asking_price": 320,
    "original_price": 798,
    "condition_label": "Like New",
    "ai_grade": "Pristine",
    "condition_score": 93,
    "description": "Both books unread. Bought on a productivity kick, never got around to them. Pristine condition, no marks. Great set for someone starting their career.",
    "status": "available",
    "co2_saved": 0.6,
    "seller_note": "Honestly just read summaries online. Books deserve a real reader.",
    "green_credits_on_purchase": 75,
  },

  # ── SPORTS ───────────────────────────────────────────────
  {
    "product_name": "Yonex Arcsaber 11 Badminton Racket",
    "category": "sports",
    "image_url": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80",
    "asking_price": 3800,
    "original_price": 9500,
    "condition_label": "Good",
    "ai_grade": "Play Worn",
    "condition_score": 79,
    "description": "Used for club-level doubles play for 6 months. Re-strung at 28lbs (BG65 string, 4 months ago). Grip replaced. Frame has no cracks. Cover included.",
    "status": "available",
    "co2_saved": 1.3,
    "seller_note": "Upgraded to Astrox. This racket has plenty of life left.",
    "green_credits_on_purchase": 150,
  },
  {
    "product_name": "Decathlon Domyos 500 Yoga Mat — 6mm",
    "category": "sports",
    "image_url": "https://images.unsplash.com/photo-1601925228245-2c0c9c70cba2?w=600&q=80",
    "asking_price": 600,
    "original_price": 1499,
    "condition_label": "Good",
    "ai_grade": "Clean, Minimal Wear",
    "condition_score": 83,
    "description": "Used for 4 months of home yoga. Washed and sun-dried after every session. Non-slip texture fully intact. No tears or peeling. Rolled, not folded.",
    "status": "available",
    "co2_saved": 0.9,
    "seller_note": "Joining a studio that provides mats. This one is spotless.",
    "green_credits_on_purchase": 75,
  },
  {
    "product_name": "Cosco Vibe Cycle 1.0 — Upright Exercise Bike",
    "category": "sports",
    "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    "asking_price": 7500,
    "original_price": 17999,
    "condition_label": "Good",
    "ai_grade": "Well Maintained",
    "condition_score": 81,
    "description": "Used 3x/week for 10 months. Flywheel smooth. Resistance knob works at all 8 levels. Seat height adjustable. Minor rust on handlebar base (shown in photo). Self-pickup Delhi NCR.",
    "status": "available",
    "co2_saved": 3.2,
    "seller_note": "Started running outdoors. Bike is just taking space now.",
    "green_credits_on_purchase": 200,
  },
]

import json

def seed():
    print(f"Seeding {len(LISTINGS)} listings...")
    inserted = 0
    for item in LISTINGS:
        extra_data = {
            "condition_label": item.get("condition_label"),
            "ai_grade": item.get("ai_grade"),
            "seller_note": item.get("seller_note"),
            "green_credits_on_purchase": item.get("green_credits_on_purchase"),
            "description": item.get("description")
        }
        item_to_insert = {
            "product_name": item["product_name"],
            "category": item["category"],
            "image_url": item["image_url"],
            "suggested_price": item.get("asking_price"),
            "original_price": item.get("original_price"),
            "condition_score": item.get("condition_score"),
            "ai_description": json.dumps(extra_data),
            "co2_saved": item.get("co2_saved"),
            "status": item.get("status"),
            "verdict": "Resell",
            "seller_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        }
        try:
            resp = supabase.table("listings").insert(item_to_insert).execute()
            print(f"  ✅ {item['product_name']}")
            inserted += 1
        except Exception as e:
            print(f"  ❌ {item['product_name']}: {e}")
    print(f"\nDone. {inserted}/{len(LISTINGS)} inserted.")

if __name__ == "__main__":
    seed()
