import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { SystemChrome } from "@/components/system/SystemChrome";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACCESS",
  description: "Registry entry system.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="sys-grid sys-scan relative min-h-dvh">
        <SystemChrome />
        <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-16">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </body>
    </html>
  );
}
