"use client";

import { useTheme } from "@/app/providers";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
