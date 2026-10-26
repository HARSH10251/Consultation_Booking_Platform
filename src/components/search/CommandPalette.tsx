"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-border/50">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <Command.Input
              placeholder="Search doctors, symptoms (e.g., chest pain, acne), or actions..."
              className="w-full py-4 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-secondary rounded-lg border border-border/50 text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No results found. Try searching for symptoms or doctors.
            </Command.Empty>

            <Command.Group heading="Quick Symptoms & Triage" className="text-[11px] font-bold text-muted-foreground px-2 py-1">
              <Command.Item
                onSelect={() => navigateTo("/doctors?symptom=heart")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Chest pain / Heart palpitations → Cardiology</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/doctors?symptom=skin")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Acne / Skin allergy / Rash → Dermatology</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/doctors?symptom=joint")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Joint pain / Backache / Knee injury → Orthopedics</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/doctors?symptom=migraine")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Activity className="w-4 h-4 text-purple-500" />
                <span>Migraine / Persistent headache → Neurology</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/doctors?symptom=child")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-emerald-500" />
                <span>Child fever / Immunization / Cough → Pediatrics</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation & Portals" className="text-[11px] font-bold text-muted-foreground px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => navigateTo("/doctors")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Find Doctors & Book Slots</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/dashboard")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Patient Dashboard & Appointments</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/waitlist")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Smart Waitlist & Queue Journey Tracker</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/admin/evaluator")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-500 hover:bg-amber-500 hover:text-white cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Evaluator Time-Machine & Payment Simulator</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
