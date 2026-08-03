import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, category, rating, message } = await req.json();

    // Validation
    if (!name || !email || !category || !rating || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      name,
      email,
      category,
      rating,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully.",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
  console.error("Feedback API Error:", error);

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "Unknown Error",
      error: String(error),
    },
    { status: 500 }
  );
}
}