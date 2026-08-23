import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const incomingFormData = await req.formData();

    const file = incomingFormData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "QR image file is required",
        },
        {
          status: 400,
        }
      );
    }

    const backendFormData = new FormData();

    backendFormData.append(
      "file",
      file
    );

    const backendResponse = await fetch(
      `${BACKEND_URL}/analyze-qr`,
      {
        method: "POST",
        body: backendFormData,
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
      "QR Verification Route Error:",
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