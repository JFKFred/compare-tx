"use client";

import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useThemeStore } from "@/store/theme-store";

export function SiteHeader() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
        <span className="text-lg font-semibold tracking-tight">Compare TX</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
