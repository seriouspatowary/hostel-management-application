"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  RiBuildingLine,
  RiGraduationCapLine,
  RiHome2Fill,
  RiUpload2Fill
} from "@remixicon/react";

import Link from "next/link";
import { paragraphVariants } from "./p";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

type SessionUser = {
  _id: string;
  name: string;
  phone: string;
  employeeId: string;
  department: string;
  isSuperAdmin: boolean;
  exp: number;
};

type Session = {
  user: SessionUser;
};

const allItems = [
  { title: "Hostel", url: "/admin/Hostel", icon: RiBuildingLine },
  { title: "Students", url: "/admin/Students", icon: RiGraduationCapLine },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/get-session");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    }
    loadSession();
  }, []);

  const itemsToShow =allItems

  if (!session) return null;

  return (
    <Sidebar collapsible="icon" className="w-60 border-none">
      <SidebarContent className="py-2">

        {/* Logo */}
        <div className="px-3 py-2 flex justify-center">
          <Image
            src="/logo1.png"
            alt="Royal Global University"
            className="mx-auto"
            width={160}
            height={40}
          />
        </div>

        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {itemsToShow.map((item) => (
                <SidebarMenuItem key={item.title} className="py-0">
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      paragraphVariants({ size: "small", weight: "medium" }),
                      "py-3 px-4 rounded-lg h-auto",
                      pathname === item.url &&
                        "bg-[#578FCA] drop-shadow-xl text-white hover:bg-[#578FCA] hover:text-white"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
