import type { ComponentType, SVGProps } from "react";
import { AnalyticsIcon, DashboardIcon, SettingsIcon, TripsIcon } from "./icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Travel Logs", href: "/trips", icon: TripsIcon },
  { label: "Analytics", href: "/analytics", icon: AnalyticsIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
