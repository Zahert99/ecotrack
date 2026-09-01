"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isNavItemActive, NAV_ITEMS } from "./navItems";

export function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const activeItem = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "";

  return (
    <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-border bg-background px-8">
      <h1 className="text-lg font-semibold text-foreground">{activeItem?.label ?? "EcoTrack"}</h1>
      {user && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {initials}
        </div>
      )}
    </header>
  );
}
