import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountryPickerModal from "@/components/CountryPickerModal";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdBanner from "@/components/ads/AdBanner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ExpertNear.Me — Find Local Experts in Asia & Middle East',
  description: 'Discover verified local experts across Singapore, UAE, Bangladesh, and Saudi Arabia. No commissions, direct contact.',
  keywords: 'local experts, service providers, freelancers, Singapore, UAE, Bangladesh, Saudi Arabia',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://expertnear.me',
    siteName: 'ExpertNear.Me',
    title: 'ExpertNear.Me — Find Local Experts in Asia & Middle East',
    description: 'Discover verified local experts across Singapore, UAE, Bangladesh, and Saudi Arabia. No commissions, direct contact.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExpertNear.Me — Find Local Experts',
    description: 'Discover verified local experts across Singapore, UAE, Bangladesh, and Saudi Arabia.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="h-16 shrink-0" />
                <AdBanner />
                <CountryPickerModal />
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
