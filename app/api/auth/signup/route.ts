import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Authentication is disabled in demo mode."
    },
    { status: 503 }
  );
}