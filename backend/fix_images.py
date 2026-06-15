import os, sys
sys.path.append(os.path.dirname(__file__))
from services.supabase_service import supabase

UPDATES = {
    "Apple MacBook Air M2 13\"": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    "Adidas Ultraboost 22 Running Shoes — UK9": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "Fabindia Linen Kurta Set — XL": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "Decathlon Domyos 500 Yoga Mat — 6mm": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
}

def fix_images():
    print("Fixing broken image URLs in Supabase...")
    for name, new_url in UPDATES.items():
        try:
            # First fetch the listing id based on product_name
            res = supabase.table("listings").select("id").eq("product_name", name).execute()
            if res.data:
                listing_id = res.data[0]["id"]
                supabase.table("listings").update({"image_url": new_url}).eq("id", listing_id).execute()
                print(f"✅ Updated {name}")
            else:
                print(f"⚠️ Could not find {name}")
        except Exception as e:
            print(f"❌ Failed to update {name}: {e}")

if __name__ == "__main__":
    fix_images()
