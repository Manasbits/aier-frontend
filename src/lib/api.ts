const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchTickers(): Promise<string[]> {
  const res = await fetch(`${BACKEND_URL}/tickers`);
  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
}

export async function triggerAnalysis(params: {
  ticker: string;
  mode: string;
  userId: string;
  requestId: string;
}): Promise<void> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || "Failed to trigger analysis");
  }
}
