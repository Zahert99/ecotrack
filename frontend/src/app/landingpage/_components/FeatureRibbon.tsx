import type { LucideIcon } from "lucide-react";
import { History, Lock, UserCheck } from "./icons";

const FEATURES: { icon: LucideIcon; title: string; caption: string }[] = [
  {
    icon: Lock,
    title: "Multi-Tenant Isolation",
    caption: "Every company's trips, users, and analytics are scoped and never cross tenants.",
  },
  {
    icon: UserCheck,
    title: "Role-Based Access",
    caption: "Admins and permitted teammates see company-wide data; everyone else sees their own.",
  },
  {
    icon: History,
    title: "Safe Historical Attribution",
    caption: "Removing a teammate preserves their trips — attribution stays intact, permanently.",
  },
];

export function FeatureRibbon() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <feature.icon className="h-5 w-5 text-landing-accent" />
          <p className="font-semibold text-landing-ink">{feature.title}</p>
          <p className="text-sm text-landing-muted">{feature.caption}</p>
        </div>
      ))}
    </div>
  );
}
