"use client";

import { create } from "zustand";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "system",
  resolvedTheme: "light",

  setTheme: (theme: Theme) => {
    const resolvedTheme = resolveTheme(theme);
    localStorage.setItem("theme", theme);
    applyTheme(resolvedTheme);
    set({ theme, resolvedTheme });
  },

  toggleTheme: () => {
    const { resolvedTheme } = get();
    const newTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const theme: Theme = stored || "system";
    const resolvedTheme = resolveTheme(theme);
    applyTheme(resolvedTheme);
    set({ theme, resolvedTheme });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      const currentTheme = get().theme;
      if (currentTheme === "system") {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    });
  },
}));
