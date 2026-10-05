import type { Metadata } from "next";
import localFont from "next/font/local";
import AppShell from "@/components/layout/app-shell";
import "./globals.css";
import "./secondary.css";

const geist = localFont({ src: "../public/fonts/geist.woff2", variable: "--font-geist", display: "swap", weight: "100 900" });
const geistMono = localFont({ src: "../public/fonts/geist-mono.woff2", variable: "--font-geist-mono", display: "swap", weight: "100 900" });

export const metadata: Metadata = {
  title: { default: "Algoking — A little practice. A lot of progress.", template: "%s · Algoking" },
  description: "A calm place to learn algorithms, recognize patterns, and practice DSA. One problem at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${geist.variable} ${geistMono.variable}`}><body><AppShell>{children}</AppShell></body></html>;
}
