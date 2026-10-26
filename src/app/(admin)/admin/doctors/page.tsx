"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors?sort=experience");
      const data = await res.json();
      if (data.doctors) setDoctors(data.doctors);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Approval failed");
        return;
      }
      toast.success(data.message || "Doctor approved!");
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Doctor Practitioners</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Verify medical credentials, assign clinic rooms, and manage active consultation schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchDoctors();
              }}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="glass-panel rounded-3xl border border-border/60 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold">
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Assigned Room</th>
                  <th className="p-4">Fee (INR)</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-foreground">
                        {doc.userId?.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {doc.userId?.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-primary">
                        {doc.specialtyId?.name}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {doc.assignedRoomId?.name || "Unassigned"}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {formatCurrency(doc.fee)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {doc.experienceYears} Years
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.approved
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {doc.approved ? "Active" : "Pending Approval"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {!doc.approved ? (
                        <button
                          onClick={() => handleApprove(doc._id)}
                          className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
