import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

type JWTPayload = {
  _id?: string;
  phone?: string;
  employeeId?: string;
  name?:string;
  department?:string;
 
};

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const url = req.nextUrl.clone();

  if (token) {
    const isValid = await verifyJWT(token);
    if (isValid) {
      if (url.pathname === "/login") {
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
  }

  if (!token && url.pathname.startsWith("/admin")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/profile/:path*"],
};
