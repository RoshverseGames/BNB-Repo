import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B&B CRM — Bridges & Blueprints",
  description:
    "A minimal, modern CRM for Bridges & Blueprints. Track companies, people, notes, pipeline stages, and follow-ups.",
  keywords: [
    "CRM",
    "B&B CRM",
    "Bridges and Blueprints",
    "companies",
    "people",
    "notes",
    "pipeline",
  ],
  icons: {
    icon: "/bnb-logo.png",
    apple: "/bnb-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
