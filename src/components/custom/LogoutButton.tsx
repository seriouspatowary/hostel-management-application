"use client";

import { logout } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { paragraphVariants } from "./p";
import { cn } from "@/lib/utils";
import { useGlobalLoader } from "@/context/LoadingContex";

export default function LogoutButton() {
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoader();

  const handleLogout = async () => {
    showLoader();
    try {
      await logout(); 
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
     
    }finally{
      hideLoader();
    }
  };



  return (
    <button
      onClick={handleLogout}
      className=" bg-blue-700 w-full text-left flex items-center gap-2 px-3 py-2  rounded-md transition-colors cursor-pointer"
    >
      <RiLogoutBoxRLine className="text-white w-5 h-5" />
      <span
      className={cn(
        paragraphVariants({ size: "small", weight: "medium" }),
        "text-white"
      )}
    >
      Log Out
    </span>

    </button>
  );
}
