import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/models/Hostel";
import Room from "@/models/Room";
import mongoose from "mongoose";
import { checkAuth } from "@/lib/checkAuth";


// GET - Get all rooms of a hostel
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

    const { id } = await params; // hostelId

    // Validate Hostel ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Hostel ID" },
        { status: 400 }
      );
    }

    const rooms = await Room.find({ hostelId: id })
      .select("roomNo seatAllocate seatNumbers createdAt")
      .sort({ roomNo: 1 });

    return NextResponse.json({
      success: true,
      totalRooms: rooms.length,
      data: rooms
    });

  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
// PATCH - Add Room to Hostel
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

    const { id } = await params; // hostelId
    const body = await req.json();
    const { roomNo, seatAllocate, seatNumbers } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Hostel ID" },
        { status: 400 }
      );
    }

    if (!roomNo || seatAllocate === undefined || !seatNumbers) {
      return NextResponse.json(
        { success: false, message: "Room number, seat allocate and seatNumbers are required" },
        { status: 400 }
      );
    }

    if (Number(seatAllocate) < 0) {
      return NextResponse.json(
        { success: false, message: "Seat allocate cannot be negative" },
        { status: 400 }
      );
    }

    const existingRoom = await Room.findOne({
      hostelId: id,
      roomNo: roomNo.trim()
    });

    if (existingRoom) {
      return NextResponse.json(
        { success: false, message: "Room already exists in this hostel" },
        { status: 400 }
      );
    }

    // 🔥 Convert array → object with 0 values
    const seatObject: Record<string, number> = {};

    seatNumbers.forEach((seat: string) => {
      seatObject[seat] = 0;
    });

    // Create Room
    const room = await Room.create({
      hostelId: id,
      roomNo: roomNo.trim(),
      seatAllocate: Number(seatAllocate),
      seatNumbers: seatObject
    });

    return NextResponse.json({
      success: true,
      data: room,
      message: "Room added successfully"
    });

  } catch (error) {
    console.error("Error adding room:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add room" },
      { status: 500 }
    );
  }
}


// PUT - Update Hostel
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

     const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }



    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const { name, totalRooms } = body;

    // Validation
    if (!name || totalRooms === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and total rooms are required" },
        { status: 400 }
      );
    }

    if (Number(totalRooms) < 0) {
      return NextResponse.json(
        { success: false, message: "Total rooms cannot be negative" },
        { status: 400 }
      );
    }

    const updatedHostel = await Hostel.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        totalRooms: Number(totalRooms)
      },
      { new: true }
    );

    if (!updatedHostel) {
      return NextResponse.json(
        { success: false, message: "Hostel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedHostel,
      message: "Hostel updated successfully"
    });

  } catch (error) {
    console.error("Error updating hostel:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hostel" },
      { status: 500 }
    );
  }
}


// DELETE - Remove Hostel
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

     const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    const deletedHostel = await Hostel.findByIdAndDelete(id);

    if (!deletedHostel) {
      return NextResponse.json(
        { success: false, message: "Hostel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hostel deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting hostel:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete hostel" },
      { status: 500 }
    );
  }
}
