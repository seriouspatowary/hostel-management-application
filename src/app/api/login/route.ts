import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // change "*" to your RN app's origin if you want stricter security
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const username= formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!username|| !password) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectToDatabase();

    const user = await Admin.findOne({ username, password });
    if (!user) {
      return NextResponse.json(
        { message: "Wrong credentials" },
        { status: 401, headers: corsHeaders }
      );
    }

    const userData = {
      _id: user._id.toString(),
      username: user.username,
    };

    // Generate JWT
    const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const token = await new SignJWT(userData)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("180d")
      .sign(secretKey);

      const response = NextResponse.json(
        { success: true, userData, token }, 
        { status: 200, headers: corsHeaders }
      );

      // new code
      
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 180 * 24 * 60 * 60,
        path: "/",
      });
      
      return response;
      
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
