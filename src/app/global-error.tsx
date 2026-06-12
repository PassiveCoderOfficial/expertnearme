"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0f172a",
          color: "#fff",
          margin: 0,
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#f97316",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            padding: "0.625rem 1.25rem",
            borderRadius: "0.75rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
