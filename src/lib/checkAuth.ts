import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

interface AuthOptions {
  requiredUsername?: string; // optional role restriction
}

export async function checkAuth(options?: AuthOptions) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId = payload._id as string;

    await connectToDatabase();

    const admin = await Admin.findById(adminId).select("username");

    if (!admin) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "Admin not found" },
          { status: 401 }
        )
      };
    }

    // Optional Role Check
    if (options?.requiredUsername && admin.username !== options.requiredUsername) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "Forbidden: Unauthorized Request" },
          { status: 403 }
        )
      };
    }

    return {
      success: true,
      admin
    };

  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      )
    };
  }
}
