"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error replaces the root layout, so it must define <html> and <body>
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          backgroundColor: "#faf1e3",
          color: "#88642a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <title>Something went wrong</title>
        <h1 style={{ fontSize: "40px", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "16px" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{
            border: "1px solid #957139",
            borderRadius: "9999px",
            padding: "0.5rem 1.5rem",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            background: "transparent",
            color: "#957139",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
