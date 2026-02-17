// app/api/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";

// GET - Fetch all photos
export async function GET() {
  try {
    await connectToDatabase();
    const photos = await Photo.find({ active: 1 }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST - Create new photo
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const { photoUrl, duration } = body;
    
    // Validation
    if (!photoUrl || !duration) {
      return NextResponse.json(
        { success: false, message: "Photo and duration are required" },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!photoUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, message: "Invalid image format. Must be base64" },
        { status: 400 }
      );
    }

    const photo = await Photo.create({
      photoUrl,
      duration: Number(duration),
      active: 1
    });

    return NextResponse.json({
      success: true,
      data: photo,
      message: "Photo uploaded successfully"
    });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
