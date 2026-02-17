import { NextRequest, NextResponse } from "next/server";
import AllocateRoom from "@/models/AllocateRoom";
import Room from "@/models/Room";
import { connectToDatabase } from "@/lib/mongodb";
import { checkAuth } from "@/lib/checkAuth";




export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });
    if (!auth.success) return auth.response;

    await connectToDatabase();

    const { boarderId, hostelId, roomId, roomNo, seatNumber } =
      await req.json();

    if (!boarderId || !hostelId || !roomId || !roomNo || !seatNumber) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // 🔥 Check seat exists
    if (!room.seatNumbers.has(seatNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid seat number" },
        { status: 400 }
      );
    }

    // 🔥 Check seat already booked
    if (room.seatNumbers.get(seatNumber) === 1) {
      return NextResponse.json(
        { success: false, message: "Seat already booked" },
        { status: 400 }
      );
    }

    const existingAllocation = await AllocateRoom.findOne({ boarderId });

    // 🔹 If allocation exists → UPDATE
    if (existingAllocation) {
      const oldRoomId = existingAllocation.roomId;
      const oldSeatNumber = existingAllocation.seatNumber;

      if (
        oldRoomId.toString() === roomId &&
        oldSeatNumber === seatNumber
      ) {
        return NextResponse.json(
          { success: false, message: "Boarder already in this seat" },
          { status: 400 }
        );
      }

      // 1️⃣ Free old seat
      await Room.updateOne(
        { _id: oldRoomId },
        { $set: { [`seatNumbers.${oldSeatNumber}`]: 0 } }
      );

      // 2️⃣ Book new seat
      await Room.updateOne(
        { _id: roomId },
        { $set: { [`seatNumbers.${seatNumber}`]: 1 } }
      );

      // 3️⃣ Update allocation
      existingAllocation.roomId = roomId;
      existingAllocation.hostelId = hostelId;
      existingAllocation.roomNo = roomNo;
      existingAllocation.seatNumber = seatNumber;
      existingAllocation.isAllocate = true;

      await existingAllocation.save();

      return NextResponse.json({
        success: true,
        message: "Room updated successfully",
        data: existingAllocation,
      });
    }

    // 🔹 New allocation

    // Book seat
    await Room.updateOne(
      { _id: roomId },
      { $set: { [`seatNumbers.${seatNumber}`]: 1 } }
    );

    const allocation = await AllocateRoom.create({
      boarderId,
      hostelId,
      roomId,
      roomNo,
      seatNumber,
      isAllocate: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Room allocated successfully",
        data: allocation,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Allocate Room Error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

