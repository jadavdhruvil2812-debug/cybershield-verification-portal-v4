import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const url = body.url || body.payload;

    if (!url || typeof url !== "string" || url.trim() === "") {
      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/analyze-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(
      data,
      {
        status: backendResponse.status,
      }
    );

  } catch (error) {

    console.error(
      "URL Verification Route Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to connect to CyberShield backend",
      },
      {
        status: 500,
      }
    );
  }
}