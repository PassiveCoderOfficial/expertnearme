// src/app/(public)/layout.tsx
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* Public layout may use smaller top padding if Navbar is not fixed for public pages */}
      <div className="pt-16">{children}</div>
    </>
  );
}
