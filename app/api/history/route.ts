import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import History from "@/models/History";

// Get all history
export async function GET() {
  try {
    await connectDB();

    const history = await History.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("History GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch history",
      },
      { status: 500 }
    );
  }
}

// Save new history
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    console.log(body);

    const history = await History.create(body);

    return NextResponse.json(
      {
        success: true,
        history,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}