"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import Sidebar from "@/app/components/Sidebar";
import UserHeader from "@/app/components/UserHeader";
import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <div className="min-h-[100dvh] px-4 py-10 pt-14 md:pt-10">
          {/* top right user header for desktop */}
          <div className="hidden md:flex md:items-center md:justify-end md:pr-6">
            <UserHeader />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
