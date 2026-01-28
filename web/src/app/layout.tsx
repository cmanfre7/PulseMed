import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseMed — Physician-Controlled Medical AI Platform",
  description:
    "PulseMed is a white-label healthcare platform that provides 24/7 patient support through an AI assistant—operating within physician-defined boundaries, strict HIPAA safeguards, and no autonomous decision making.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${dmSerif.variable} ${inter.variable} font-sans antialiased bg-[#FAFAF7] text-[#1A1A1A]`}>
        {children}
      </body>
    </html>
  );
}
