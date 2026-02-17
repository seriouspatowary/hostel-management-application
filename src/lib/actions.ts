// app/actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", {
    path: "/",
    maxAge: 0,
  });

  redirect("/login");
};
