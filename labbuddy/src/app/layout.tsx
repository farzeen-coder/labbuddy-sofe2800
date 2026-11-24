import type { Metadata, Viewport } from "next";
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
  title: "LabBuddy | Lab reports, without the chaos",
  description:
    "Pre-labs, partner tasks and deadlines in one shared dashboard for lab partners. Built by Clueless Commit at Ontario Tech University.",
  openGraph: {
    title: "LabBuddy",
    description: "Pre-labs, partner tasks and deadlines in one shared dashboard.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-900 font-sans">{children}</body>
    </html>
  );
}
