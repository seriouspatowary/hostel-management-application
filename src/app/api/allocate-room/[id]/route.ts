import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import { checkAuth } from "@/lib/checkAuth";
import AllocateRoom from "@/models/AllocateRoom";
import Room from "@/models/Room";


// GET - Get minimal allocation details of a boarder
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params; // boarderId

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Boarder ID" },
        { status: 400 }
      );
    }

    const allocation = await AllocateRoom.findOne({
      boarderId: id,
      isAllocate: true
    })
      .populate("boarderId", "name phone") // only required fields
      .populate("hostelId", "name")
      .select("roomNo seatNumber createdAt"); // only required fields from AllocateRoom

    if (!allocation) {
      return NextResponse.json(
        { success: false, message: "Boarder is not allocated any room" },
        { status: 404 }
      );
    }

    // 🔥 Format clean response
    const responseData = {
      boarderName: allocation.boarderId.name,
      phone: allocation.boarderId.phone,
      hostelName: allocation.hostelId.name,
      roomNo: allocation.roomNo,
      seatNumber:allocation.seatNumber,
      allocatedAt: allocation.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching allocation details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch allocation details" },
      { status: 500 }
    );
  }
}



export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params; // boarderId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Boarder ID" },
        { status: 400 }
      );
    }

    // 1️⃣ Find active allocation
    const allocation = await AllocateRoom.findOne({
      boarderId: id,
      isAllocate: true,
    });

    if (!allocation) {
      return NextResponse.json(
        { success: false, message: "No active room allocation found" },
        { status: 404 }
      );
    }

    const roomId = allocation.roomId;
    const seatNumber = allocation.seatNumber;

    // 2️⃣ Make seat vacant (set to 0)
    await Room.updateOne(
      { _id: roomId },
      { $set: { [`seatNumbers.${seatNumber}`]: 0 } }
    );

    // 3️⃣ Mark allocation inactive
    allocation.isAllocate = false;
    await allocation.save();

    return NextResponse.json({
      success: true,
      message: "Room vacated successfully",
    });

  } catch (error) {
    console.error("Error during room disallocation:", error);

    return NextResponse.json(
      { success: false, message: "Failed to disallocate room" },
      { status: 500 }
    );
  }
}

