"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

type JWTPayload = {
  _id?: string;
  username?: string;
  
};

export const getSession = async (): Promise<JWTPayload | null> => {
  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.warn("No session token found in cookies");
      return null;
    }

    const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    return payload as JWTPayload;
  } catch (err) {
    console.error("Invalid session token:", (err as Error).message);
    return null;
  }
};

