// src/app/(public)/verify/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-[#b84c4c] mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-700 mb-6">
          Please verify your email within <strong>30 days</strong> to activate your account.
        </p>
        <p className="text-sm text-gray-500">
          You will be redirected to your dashboard automatically in 10 seconds...
        </p>
      </div>
    </main>
  );
}
