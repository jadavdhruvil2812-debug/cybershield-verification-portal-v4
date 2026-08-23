import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sms = (body.sms || body.payload || "").toString().trim();

    if (!sms) {
      return NextResponse.json(
        {
          status: "Safe",
          recommendation: "No message content was provided for verification.",
          input_text: "",
        },
        { status: 400 }
      );
    }

    // 1. Call FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/verify-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sms }),
      cache: "no-store",
    });

    // 2. Validate Content-Type before calling .json()
    const contentType = backendResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorHtml = await backendResponse.text();
      console.error(
        `FastAPI non-JSON response (Status ${backendResponse.status}):`,
        errorHtml.slice(0, 300)
      );

      return NextResponse.json(
        {
          status: "Suspicious",
          recommendation: `Backend service error (HTTP ${backendResponse.status}). Please check FastAPI console logs.`,
          input_text: sms,
        },
        { status: backendResponse.status || 500 }
      );
    }

    const data = await backendResponse.json();

    // 3. Return normalized response
    const cleanStatus = (data.status || data.prediction || "Safe") as "Safe" | "Suspicious" | "Unsafe";

    return NextResponse.json({
      status: cleanStatus,
      recommendation:
        data.recommendation ||
        (cleanStatus === "Safe"
          ? "This message appears legitimate and safe to interact with."
          : cleanStatus === "Suspicious"
          ? "Caution advised. Verify the sender before proceeding."
          : "High risk detected. Do not click links or share credentials."),
      input_text: sms,
    });
  } catch (error: any) {
    console.error("SMS Verification Proxy Error:", error?.message || error);

    return NextResponse.json(
      {
        status: "Safe",
        recommendation: "Unable to reach AI verification backend. Ensure FastAPI server is running on port 8000.",
        input_text: "",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "CyberShield SMS verification API proxy is ready.",
  });
}