"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isNavItemActive, NAV_ITEMS } from "./navItems";
import { LogoutIcon } from "./icons";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-primary text-primary-foreground z-40">
      <div className="px-6 py-6 flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M5 21c8 0 13-5 13-13V5h-3C7 5 2 10 2 18v3z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 21c3-3 5-7 5-12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xl font-semibold tracking-tight">EcoTrack</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors border-l-4 ${
                active
                  ? "border-white bg-primary-foreground/10 text-primary-foreground"
                  : "border-transparent text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-3 py-4 border-t border-primary-foreground/15 space-y-1">
          <div className="px-3 py-1.5">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-primary-foreground/60 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
