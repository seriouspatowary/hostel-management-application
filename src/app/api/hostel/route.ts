// app/api/hostels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/models/Hostel";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Admin from "@/models/Admin";
import { checkAuth } from "@/lib/checkAuth";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// GET - Fetch all hostels
export async function GET() {
  try {
    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }

    await connectToDatabase();
    const hostels = await Hostel.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    console.error("Error fetching hostels:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hostels" },
      { status: 500 }
    );
  }
}

// POST - Create new hostel
export async function POST(req: NextRequest) {
  try {

    const auth = await checkAuth({ requiredUsername: "HostelAdmin" });

    if (!auth.success) {
      return auth.response;
    }

    const body = await req.json();

    const { name, totalRooms } = body;

    // Validation
    if (!name || totalRooms === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and total seats are required" },
        { status: 400 }
      );
    }

    if (Number(totalRooms) < 0) {
      return NextResponse.json(
        { success: false, message: "Total seats cannot be negative" },
        { status: 400 }
      );
    }

    const hostel = await Hostel.create({
      name: name.trim(),
      totalRooms: Number(totalRooms)
    });

    return NextResponse.json({
      success: true,
      data: hostel,
      message: "Hostel created successfully"
    });
  } catch (error) {
    console.error("Error creating hostel:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create hostel" },
      { status: 500 }
    );
  }
}
