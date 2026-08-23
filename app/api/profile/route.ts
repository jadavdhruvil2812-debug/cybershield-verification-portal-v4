import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Missing or invalid authorization header.",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: { id: string; email: string };
    try {
      decoded = verifyToken(token) as { id: string; email: string };
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid or expired cryptographic token.",
        },
        { status: 401 }
      );
    }

    const {
      name,
      phone,
      bio,
      location,
      website,
      profileImage,
    } = await req.json();

    // Construct update payload dynamically to avoid overriding values with undefined
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Operator telemetry record not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Operator profile updated successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error during profile synchronization.",
      },
      {
        status: 500,
      }
    );
  }
}