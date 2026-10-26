"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Doctor-specific fields
  const [specialtyId, setSpecialtyId] = useState("cardiology");
  const [qualifications, setQualifications] = useState("MBBS, MD");
  const [experienceYears, setExperienceYears] = useState("8");
  const [fee, setFee] = useState("800");
  const [bio, setBio] = useState("Experienced specialist committed to evidence-based compassionate care.");
  const [languages, setLanguages] = useState("English, Hindi");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === "doctor") {
        payload.specialtyId = specialtyId;
        payload.qualifications = qualifications.split(",").map((q) => q.trim()).filter(Boolean);
        payload.experienceYears = Number(experienceYears);
        payload.fee = Number(fee);
        payload.bio = bio;
        payload.languages = languages.split(",").map((l) => l.trim()).filter(Boolean);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success(
        role === "doctor"
          ? "Doctor profile submitted! Your account is pending admin approval."
          : "Account created successfully! Please sign in."
      );
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 aurora-bg">
      <div className="w-full max-w-xl">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/20 dark:border-white/10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-3">
              <Activity className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create your Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join CareSlot for seamless clinic booking and intelligent waitlists
            </p>
          </div>

          {/* Role selector tab */}
          <div className="flex p-1 rounded-2xl bg-secondary/80 mb-6">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "patient"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "doctor"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor (Practitioner)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe / Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Doctor-specific fields */}
            {role === "doctor" && (
              <div className="pt-2 border-t border-border/50 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Specialty
                    </label>
                    <select
                      value={specialtyId}
                      onChange={(e) => setSpecialtyId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    >
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="neurology">Neurology</option>
                      <option value="general-medicine">General Medicine</option>
                      <option value="ent">ENT Specialist</option>
                      <option value="ophthalmology">Ophthalmology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Fee (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Qualifications (comma separated)
                    </label>
                    <input
                      type="text"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="MBBS, MD, DNB"
                      className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="English, Hindi, Bengali"
                      className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Bio & Clinical Focus
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-background/80 border border-input focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{role === "doctor" ? "Submit Application" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
