import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Photo from "@/models/Photo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params; 

    const photo = await Photo.findById(id);

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: photo });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();

    const { photoUrl, duration, active } = body;

    // Now includes active
    const updateData: Partial<{ photoUrl: string; duration: number; active: number }> = {};

    // Validate & update photoUrl
    if (photoUrl) {
      if (!photoUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { success: false, message: "Invalid image format. Must be base64" },
          { status: 400 }
        );
      }
      updateData.photoUrl = photoUrl;
    }

    // Update duration
    if (duration !== undefined) {
      updateData.duration = Number(duration);
    }

    // Update active
    if (active !== undefined) {
      updateData.active = Number(active);
    }

    const photo = await Photo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: photo,
      message: "Photo updated successfully"
    });

  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update photo" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params; 

    const deletedPhoto = await Photo.findByIdAndDelete(id); 

    if (!deletedPhoto) {
      return NextResponse.json(
        { success: false, message: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo permanently deleted"
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
