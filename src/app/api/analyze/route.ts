import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminFieldValue } from "@/lib/firebaseAdmin";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, mode, userId, requestId } = body;

    if (!ticker || !requestId) {
      return NextResponse.json(
        { error: "ticker and requestId are required" },
        { status: 400 },
      );
    }

    // Fire-and-forget: send the request to the backend but don't wait for it.
    // The backend will write results to Firestore when done if it receives the request.
    // If the backend is unreachable (network timeout, etc.), we mark the request as failed
    // and roll back the dailyUsage counter so the user doesn't get stuck in "Processing".
    fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify({
        ticker,
        mode: mode || "full_report",
        agent: "agent",
        userId: userId || "",
        requestId,
      }),
    }).catch(async (err) => {
      console.error("Backend analyze request failed:", err);

      if (!adminDb || !userId || !requestId) {
        return;
      }

      try {
        // Mark the request as failed so the UI reflects the error instead of staying "Processing".
        const reqRef = adminDb.collection("requests").doc(requestId);
        await reqRef.set(
          {
            status: "failed",
            errorDetail: "Could not reach analysis backend. Please try again.",
            updatedAt: adminFieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        // Roll back today's usage counter.
        const today = new Date().toISOString().slice(0, 10);
        const usageRef = adminDb.collection("dailyUsage").doc(`${userId}_${today}`);
        await usageRef.update({
          count: adminFieldValue.increment(-1),
          requests: adminFieldValue.arrayRemove(requestId),
        });
      } catch (updateErr) {
        console.error("Failed to update Firestore after backend error:", updateErr);
      }
    });

    return NextResponse.json({ status: "accepted", requestId }, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
