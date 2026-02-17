import { getSession } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiNotification3Fill } from "@remixicon/react";
import { paragraphVariants } from "./p";
import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

export default async function ProfileHeader() {
  const session = await getSession();

  if (!session) return null;

  const fallbackInitials = session.username?.charAt(0).toUpperCase() ?? "R";

  return (
    <div className="flex items-center gap-4">

      {/* Profile Dropdown*/}
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 px-2 py-0.5 rounded-md transition">
        <Avatar className="w-9 h-9 border-2 border-blue-500 shadow-lg overflow-hidden rounded-full">
          <AvatarImage
            src="/default1.png"
            alt="User"
            className="object-cover w-full h-full aspect-square brightness-110 contrast-110 saturate-125"
          />
          <AvatarFallback className="text-sm font-semibold bg-blue-100 text-blue-700">
            {fallbackInitials}
          </AvatarFallback>
       </Avatar>

          <div className="text-left leading-none hidden md:block">
            <p className="font-semibold text-sm text-gray-800">{session.username || "User"}</p>
          </div>
        </div>
      </DropdownMenuTrigger>

        <DropdownMenuContent className="px-2 shadow-lg rounded-xl mt-2 w-44">
          
          <LogoutButton />
          </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
