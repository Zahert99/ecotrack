"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isNavItemActive, NAV_ITEMS } from "./navItems";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 w-full z-40 items-center justify-around border-t border-border bg-background py-2">
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
