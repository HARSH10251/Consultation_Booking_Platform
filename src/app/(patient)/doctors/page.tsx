"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { AvailabilityHeatStrip, HeatDay } from "@/components/booking/AvailabilityHeatStrip";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

function DoctorsPageContent() {
  const searchParams = useSearchParams();
  const initialSymptom = searchParams.get("symptom") || "";
  const initialSpecialty = searchParams.get("specialty") || "all";

  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [symptomFilter, setSymptomFilter] = useState(initialSymptom);
  const [sortBy, setSortBy] = useState("rating");

  // Mock / loaded heat strips per doctor
  const [heatStrips, setHeatStrips] = useState<Record<string, HeatDay[]>>({});

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, symptomFilter, sortBy]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty && selectedSpecialty !== "all") params.set("specialty", selectedSpecialty);
      if (symptomFilter) params.set("symptom", symptomFilter);
      if (searchQuery) params.set("q", searchQuery);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const data = await res.json();
      if (data.doctors) {
        setDoctors(data.doctors);
        // Fetch heat strip for first few doctors
        for (const doc of data.doctors.slice(0, 6)) {
          fetchHeatStrip(doc._id);
        }
      }
      if (data.specialties) setSpecialties(data.specialties);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatStrip = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/slots/heat-strip?doctorId=${doctorId}`);
      const data = await res.json();
      if (data.heatStrip) {
        setHeatStrips((prev) => ({ ...prev, [doctorId]: data.heatStrip }));
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CommandPalette />

      <main className="flex-1 container py-8 max-w-7xl">
        {/* Hero Search Bar */}
        <div className="p-8 rounded-3xl glass-panel border border-border/60 shadow-lg relative overflow-hidden mb-8 aurora-bg">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-3 inline-block">
              12 Board-Certified Specialists
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Find Verified Doctors & Book Slots Instantly
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Browse by symptoms, view 7-day live availability heat strips, and enjoy zero double-booking with instant Razorpay checkout.
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by doctor name, specialty, or condition (or press Cmd+K)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background/90 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Specialty Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedSpecialty("all");
                setSymptomFilter("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSpecialty === "all" && !symptomFilter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Specialties
            </button>
            {specialties.map((s) => (
              <button
                key={s._id}
                onClick={() => {
                  setSelectedSpecialty(s.slug);
                  setSymptomFilter("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSpecialty === s.slug
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-secondary/80 border border-border/50 text-xs font-semibold"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee_asc">Fee: Low to High</option>
              <option value="fee_desc">Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-secondary/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-border/50">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-lg">No doctors found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clearing symptom filters, or browsing other specialties.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const docStrip = heatStrips[doc._id] || [];

              return (
                <div
                  key={doc._id}
                  className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden"
                >
                  <div>
                    {/* Header: Avatar + Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {doc.userId?.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("") || "DR"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{doc.ratingAvg?.toFixed(1) || "5.0"}</span>
                          <span className="text-muted-foreground font-normal">
                            ({doc.ratingCount || 24} reviews)
                          </span>
                        </div>
                        <h3 className="font-bold text-base truncate text-foreground group-hover:text-primary transition-colors">
                          {doc.userId?.name}
                        </h3>
                        <p className="text-xs text-primary font-medium truncate">
                          {doc.specialtyId?.name}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Exp: <strong>{doc.experienceYears} yrs</strong></span>
                      <span>•</span>
                      <span>{doc.assignedRoomId?.name || "Clinic Room"}</span>
                    </div>

                    {/* 7-Day Availability Heat Strip */}
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                        <span className="font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          7-Day Availability
                        </span>
                        <span className="text-[10px]">Real-time slots</span>
                      </div>

                      {docStrip.length > 0 ? (
                        <div className="grid grid-cols-7 gap-1">
                          {docStrip.map((day) => (
                            <div
                              key={day.date}
                              className={`py-1.5 rounded-lg text-center flex flex-col items-center text-[10px] ${
                                day.availableCount > 0
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "bg-secondary/60 text-muted-foreground/60"
                              }`}
                              title={`${day.date}: ${day.availableCount} available`}
                            >
                              <span className="text-[9px] uppercase">{day.dayOfWeek}</span>
                              <span>{day.availableCount > 0 ? day.availableCount : "—"}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-8 rounded-lg bg-secondary/30 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Footer: Fee & Action */}
                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Consultation
                      </span>
                      <strong className="text-base font-black text-foreground">
                        {formatCurrency(doc.fee)}
                      </strong>
                    </div>

                    <Link
                      href={`/doctors/${doc._id}`}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-1"
                    >
                      <span>Book Slot</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading doctors...</div>}>
      <DoctorsPageContent />
    </Suspense>
  );
}
