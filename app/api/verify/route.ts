import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sms = (body.payload || body.sms || "").toString().trim();

    if (!sms) {
      return NextResponse.json(
        {
          error: "SMS is required",
          status: "Safe",
          recommendation: "No message text provided.",
        },
        { status: 400 }
      );
    }

    // Call FastAPI Backend
    const response = await fetch(`${API_URL}/verify-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sms }),
      cache: "no-store",
    });

    // Check if the response is valid JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error(
        `FastAPI returned non-JSON response (Status: ${response.status}):`,
        rawText.slice(0, 300) // Log first 300 characters of HTML error
      );

      return NextResponse.json(
        {
          error: `FastAPI endpoint returned HTTP ${response.status}`,
          status: "Suspicious",
          recommendation: "Backend service returned an invalid response. Please verify FastAPI routes.",
        },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err: any) {
    console.error("SMS Verify API Error:", err?.message || err);

    return NextResponse.json(
      {
        error: "Unable to connect to AI Backend. Ensure FastAPI is running on port 8000.",
        status: "Safe",
        recommendation: "Service temporarily unavailable. Verify server status.",
      },
      { status: 500 }
    );
  }
}