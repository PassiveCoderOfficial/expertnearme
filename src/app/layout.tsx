/**
 * src/app/layout.tsx
 *
 * Root layout with Geist fonts and responsive Navbar.
 * Adds top padding so content doesn’t overlap fixed nav.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/ToastProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExpertNear.Me",
  description: "Your local expert directory",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <div className="pt-16">{children}</div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
