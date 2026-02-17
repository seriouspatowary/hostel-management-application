import { NextRequest, NextResponse } from "next/server";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase-cofig";
import AllocateRoom from "@/models/AllocateRoom";

import HostelBoarder from "@/models/HostelBoarder";
import { connectToDatabase } from "@/lib/mongodb";

// POST: Register Hostel Boarder
export async function POST(req: Request) {
  try {
    await connectToDatabase

    const formData = await req.formData();

    // 📸 Files
    const photoFile = formData.get("photo") as File | null;
    const aadharFile = formData.get("aadharCard") as File | null;

    // 🧾 Fields
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const dob = formData.get("dob") as string | null;
    const phone = formData.get("phone") as string | null;
    const isStudent = formData.get("isStudent") as string | null;
    const organisation = formData.get("organisation") as string | null;
    const parentName = formData.get("parentName") as string | null;
    const parentNumber = formData.get("parentNumber") as string | null;

    // ✅ Basic Validation
    if (
      !name ||
      !email ||
      !dob ||
      !phone ||
      !isStudent ||
      !parentName ||
      !parentNumber
    ) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    if (!photoFile || !aadharFile) {
      return NextResponse.json(
        { success: false, message: "Photo and Aadhar Card are required" },
        { status: 400 }
      );
    }

    // ==============================
    // 🔼 Upload Photo to Firebase
    // ==============================
    const photoPath = `PG/HostelBoarders/Photos/${Date.now()}-${photoFile.name}`;
    const photoRef = ref(storage, photoPath);
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());

    await uploadBytes(photoRef, photoBuffer, {
      contentType: photoFile.type,
    });

    const photoURL = await getDownloadURL(photoRef);

    // ==============================
    // 🔼 Upload Aadhar to Firebase
    // ==============================
    const aadharPath = `PG/HostelBoarders/Aadhar/${Date.now()}-${aadharFile.name}`;
    const aadharRef = ref(storage, aadharPath);
    const aadharBuffer = Buffer.from(await aadharFile.arrayBuffer());

    await uploadBytes(aadharRef, aadharBuffer, {
      contentType: aadharFile.type,
    });

    const aadharURL = await getDownloadURL(aadharRef);

    // ==============================
    // 💾 Save to Database
    // ==============================
    const boarder = await HostelBoarder.create({
      name,
      email,
      dob,
      phone,
      photo: photoURL,
      aadharCard: aadharURL,
      isStudent,
      organisation,
      parentName,
      parentNumber,
    });

    return NextResponse.json({
      success: true,
      data: boarder,
      message: "Hostel boarder registered successfully",
    });

  } catch (error) {
    console.error("Error registering hostel boarder:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register hostel boarder" },
      { status: 500 }
    );
  }
}



// GET - Fetch Boarders with Pagination + Search + Allocation Status
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 🔍 Search condition
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { parentName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Total count
    const total = await HostelBoarder.countDocuments(searchQuery);

    // Fetch boarders
    const boarders = await HostelBoarder.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // 🔥 important for modifying data

    // 🔥 Get allocated boarder IDs (only active allocations)
    const allocatedBoarders = await AllocateRoom.find({
      isAllocate: true,
    }).select("boarderId");

    const allocatedIds = new Set(
      allocatedBoarders.map((a) => a.boarderId.toString())
    );

    // 🔥 Attach isAllocated field
    const updatedBoarders = boarders.map((boarder: any) => ({
      ...boarder,
      isAllocated: allocatedIds.has(boarder._id.toString()),
    }));

    return NextResponse.json({
      success: true,
      data: updatedBoarders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching hostel boarders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hostel boarders" },
      { status: 500 }
    );
  }
}
