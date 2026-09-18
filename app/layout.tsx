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
  title: "Praise Feast 2.0 - Feast & Fellowship",
  description:
    "Join Praise Feast 2.0 - Feast & Fellowship with Gift Godwin Mordi, Deacon Famous, Min MTag, Oba Praise, Min Magdalene, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#120c1d] text-[#f8f5f2]">{children}</body>
    </html>
  );
}
