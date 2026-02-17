"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/redux/slices/authSlice";

export default function InitAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("/api/get-session");
        const data = await res.json();
        if (data?.user) {
          dispatch(setUser(data.user)); 
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      }
    };

    restoreSession();
  }, [dispatch]);

  return null;
}
