from fastapi import APIRouter, HTTPException

from services import supabase_service

router = APIRouter()


@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str):
    try:
        user = supabase_service.get_user(user_id)
        transactions = supabase_service.get_user_transactions(user_id)
        leaderboard = supabase_service.get_leaderboard()

        leaderboard_rank = next(
            (i + 1 for i, entry in enumerate(leaderboard) if entry["id"] == user_id),
            None,
        )

        return {
            "user": user,
            "credits_balance": user["credits_balance"],
            "co2_saved_kg": user["co2_saved_kg"],
            "transaction_history": transactions,
            "leaderboard_rank": leaderboard_rank,
            "total_transactions": len(transactions),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard():
    try:
        return supabase_service.get_leaderboard()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
