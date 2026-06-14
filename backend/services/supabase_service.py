import os
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_user(user_id: str) -> dict:
    try:
        response = supabase.schema("public").table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to get user {user_id}: {str(e)}")


def update_user_credits(user_id: str, credits_to_add: int, co2_to_add: float) -> dict:
    try:
        user = get_user(user_id)
        new_credits = user["credits_balance"] + credits_to_add
        new_co2 = float(user["co2_saved_kg"]) + co2_to_add
        response = (
            supabase.schema("public").table("users")
            .update({"credits_balance": new_credits, "co2_saved_kg": new_co2})
            .eq("id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to update credits for user {user_id}: {str(e)}")


def create_listing(listing_data: dict) -> dict:
    try:
        response = supabase.schema("public").table("listings").insert(listing_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to create listing: {str(e)}")


def get_listings(category: str = None, status: str = "available") -> list:
    try:
        query = supabase.schema("public").table("listings").select("*").eq("status", status)
        if category:
            query = query.eq("category", category)
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise Exception(f"Failed to get listings: {str(e)}")


def get_listing(listing_id: str) -> dict:
    try:
        response = supabase.schema("public").table("listings").select("*").eq("id", listing_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to get listing {listing_id}: {str(e)}")


def update_listing_status(listing_id: str, status: str) -> dict:
    try:
        response = (
            supabase.schema("public").table("listings")
            .update({"status": status})
            .eq("id", listing_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to update listing {listing_id} status: {str(e)}")


def get_product(product_id: str) -> dict:
    try:
        response = supabase.schema("public").table("products").select("*").eq("id", product_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to get product {product_id}: {str(e)}")


def get_product_by_index(index: int) -> dict:
    try:
        response = supabase.schema("public").table("products").select("*").execute()
        products = response.data
        if index < 1 or index > len(products):
            return products[0] if products else None
        return products[index - 1]
    except Exception as e:
        raise Exception(f"Failed to get product by index: {str(e)}")


def get_all_products() -> list:
    try:
        response = supabase.schema("public").table("products").select("*").execute()
        return response.data
    except Exception as e:
        raise Exception(f"Failed to get all products: {str(e)}")


def add_transaction(transaction_data: dict) -> dict:
    try:
        response = supabase.schema("public").table("transactions").insert(transaction_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Failed to add transaction: {str(e)}")


def get_user_transactions(user_id: str) -> list:
    try:
        response = (
            supabase.schema("public").table("transactions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise Exception(f"Failed to get transactions for user {user_id}: {str(e)}")


def get_leaderboard() -> list:
    try:
        response = (
            supabase.schema("public").table("users")
            .select("*")
            .order("credits_balance", desc=True)
            .limit(10)
            .execute()
        )
        return response.data
    except Exception as e:
        raise Exception(f"Failed to get leaderboard: {str(e)}")
