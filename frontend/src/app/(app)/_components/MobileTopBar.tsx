"use client";

import { useAuth } from "@/context/AuthContext";
import { LogoutIcon } from "./icons";

export function MobileTopBar() {
  const { user, logout } = useAuth();
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "";

  return (
    <header className="flex md:hidden fixed top-0 left-0 w-full z-40 h-16 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {initials}
        </div>
        <span className="text-lg font-semibold tracking-tight text-primary">EcoTrack</span>
      </div>
      <button
        type="button"
        onClick={logout}
        aria-label="Log out"
        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <LogoutIcon className="h-5 w-5" />
      </button>
    </header>
  );
}
