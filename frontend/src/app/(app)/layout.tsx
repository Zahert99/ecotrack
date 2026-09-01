"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./_components/Sidebar";
import { TopBar } from "./_components/TopBar";
import { MobileTopBar } from "./_components/MobileTopBar";
import { BottomNav } from "./_components/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-full">
      <Sidebar />
      <MobileTopBar />
      <BottomNav />
      <main className="pt-16 pb-20 md:pt-0 md:pb-0 md:pl-64">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
