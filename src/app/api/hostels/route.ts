import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Room from "@/models/Room";
import Hostel from "@/models/Hostel";
import { checkAuth } from "@/lib/checkAuth";
import { Types } from "mongoose";


interface PopulatedRoom {
  _id: Types.ObjectId;
  roomNo: string;
  seatAllocate: number;
  bookRoom?: number;
  seatNumbers: Map<string, number>;
  hostelId: {
    _id: Types.ObjectId;
    name: string;
  } | null;
}


// GET - Fetch Hostels with their Rooms and Seat Count
export async function GET() {
  try {

    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });
    
    if (!auth.success) {
        return auth.response;
    }
    await connectToDatabase();

    // Fetch all hostels
    const hostels = await Hostel.find().sort({ createdAt: -1 });

    // Fetch all rooms and populate hostel
    const rooms = await Room.find()
      .populate("hostelId", "name")
      .select("hostelId roomNo seatAllocate bookRoom seatNumbers");

    // Group rooms under their hostel
    const result = hostels.map((hostel) => {
      const hostelRooms = (rooms as PopulatedRoom[]).filter(
        (room) =>
          room.hostelId &&
          room.hostelId._id.toString() === hostel._id.toString()
      );


      return {
        hostelId: hostel._id,
        hostelName: hostel.name,
        rooms: hostelRooms.map((room: PopulatedRoom) => ({
          roomId: room._id,
          roomNo: room.roomNo,
          seatAllocate: room.seatAllocate,
          bookRoom: room.bookRoom,
          seatNumbers: room.seatNumbers
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Error fetching hostels with rooms:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
