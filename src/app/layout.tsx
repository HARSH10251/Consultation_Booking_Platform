import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "CareSlot - Smart Clinic Appointment & Waitlist Platform",
  description:
    "Instant doctor appointment booking with zero double-booking, real-time live delay estimation, and an intelligent cascading waitlist engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased pb-16 md:pb-0">
        <Providers>
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
