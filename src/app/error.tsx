// src/app/error.tsx
"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <a href="/" className="text-[#b84c4c] hover:underline">
        Go back home
      </a>
    </main>
  );
}
