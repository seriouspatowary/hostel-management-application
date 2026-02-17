import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Room from "@/models/Room";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; roomId: string }>;
  }
) {
  try {
    await connectToDatabase();

    const { id:hostelId, roomId:allocationId } = await params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(hostelId) ||
      !mongoose.Types.ObjectId.isValid(allocationId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID provided" },
        { status: 400 }
      );
    }

    // Make sure room belongs to that hostel
    const room = await Room.findOneAndDelete({
      _id: allocationId,
      hostelId: hostelId,
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room allocation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room allocation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room allocation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete room allocation" },
      { status: 500 }
    );
  }
}
