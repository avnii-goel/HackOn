from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import disposition, prevention, marketplace, credits

load_dotenv()

app = FastAPI(title="Second Life Commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disposition.router, prefix="/disposition")
app.include_router(prevention.router, prefix="/prevention")
app.include_router(marketplace.router, prefix="/marketplace")
app.include_router(credits.router, prefix="/credits")


@app.get("/health")
async def health_check():
    return {"status": "ok", "project": "Second Life Commerce"}
