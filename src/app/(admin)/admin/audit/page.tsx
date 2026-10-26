"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";
import { FileText, RefreshCw, ShieldCheck } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Security & Transaction Audit Logs</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Immutable ledger of all booking, cancellation, refund, hold, and role access events.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchLogs();
            }}
            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="glass-panel rounded-3xl border border-border/60 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.action?.includes("BLOCKED")
                            ? "bg-rose-500/15 text-rose-500"
                            : log.action?.includes("CONFIRMED")
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : log.action?.includes("CANCEL")
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <span className="font-semibold text-foreground">
                        {log.actorId?.name || "System Automated"}
                      </span>
                      {log.actorId?.role && (
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          ({log.actorId?.role})
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-foreground">{log.entityType}</td>
                    <td className="p-4 text-muted-foreground text-[11px] truncate max-w-xs">
                      {log.meta ? JSON.stringify(log.meta) : "—"}
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
