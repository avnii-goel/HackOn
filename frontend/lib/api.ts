import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;

// Products
export async function getProducts() {
  const res = await api.get("/marketplace/products");
  return res.data;
}

// Return Risk
export async function getReturnRisk(productId: string) {
  const res = await api.get(`/prevention/risk/${productId}`);
  return res.data;
}

// Disposition Analysis
export async function analyzeDisposition(formData: FormData) {
  const res = await api.post("/disposition/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Listings
export async function getListings(filters?: {
  category?: string;
  max_price?: number;
  condition_min?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.max_price) params.append("max_price", filters.max_price.toString());
  if (filters?.condition_min) params.append("condition_min", filters.condition_min.toString());
  const res = await api.get(`/marketplace/listings?${params.toString()}`);
  return res.data;
}

// Purchase
export async function purchaseListing(listingId: string, buyerId: string) {
  const res = await api.post(`/marketplace/purchase/${listingId}`, {
    buyer_id: buyerId,
  });
  return res.data;
}

// Wallet
export async function getWallet(userId: string) {
  const res = await api.get(`/credits/wallet/${userId}`);
  return res.data;
}

// Leaderboard
export async function getLeaderboard() {
  const res = await api.get("/credits/leaderboard");
  return res.data;
}

// Intercept
export async function interceptReturn(userId: string, productId: string, choice: string) {
  const res = await api.post("/prevention/intercept", {
    user_id: userId,
    product_id: productId,
    choice,
  });
  return res.data;
}
