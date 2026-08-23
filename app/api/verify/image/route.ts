import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const incomingFormData = await req.formData();
    const file = incomingFormData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Image file is required",
          status: "Safe",
          recommendation: "Please select an image file to upload.",
          extracted_text: "",
        },
        { status: 400 }
      );
    }

    // Prepare FormData payload for FastAPI Backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Forward image to FastAPI OCR & Threat Analysis endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/verify-image`, {
      method: "POST",
      body: backendFormData,
      cache: "no-store",
    });

    // Validate Content-Type before parsing JSON
    const contentType = backendResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await backendResponse.text();
      console.error(
        `FastAPI Non-JSON Response (Status ${backendResponse.status}):`,
        errorText.slice(0, 300)
      );

      return NextResponse.json(
        {
          status: "Safe",
          recommendation: "Unable to parse OCR payload from backend. Please ensure FastAPI server is online.",
          extracted_text: "",
        },
        { status: backendResponse.status || 500 }
      );
    }

    const data = await backendResponse.json();

    // Strict Binary Normalization (Only explicit Safe is Safe, everything else is Unsafe)
    const rawStatus = (data.status || data.prediction || "Safe").toString().toUpperCase().trim();
    const isSafe = rawStatus === "SAFE" || rawStatus === "CLEAN" || rawStatus === "LEGITIMATE";
    const cleanStatus = isSafe ? "Safe" : "Unsafe";

    return NextResponse.json(
      {
        status: cleanStatus,
        recommendation:
          data.recommendation ||
          (cleanStatus === "Unsafe"
            ? "High threat detected in image! Image contains elements of phishing, fake urgency, or untrusted links. Do NOT call numbers, scan codes, or visit links."
            : "This image appears legitimate and safe to interact with."),
        extracted_text: data.extracted_text || "",
      },
      { status: backendResponse.status }
    );
  } catch (error: any) {
    console.error("Image Verification Proxy Error:", error?.message || error);

    return NextResponse.json(
      {
        status: "Safe",
        recommendation: "Unable to establish connection with CyberShield AI Backend.",
        extracted_text: "",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "CyberShield Image Forensics API proxy is active and ready.",
  });
}