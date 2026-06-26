import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes App",
  description: "A beautiful notes-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-cream">{children}</body>
    </html>
  );
}
