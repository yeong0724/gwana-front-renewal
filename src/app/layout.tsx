import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gwana tea house",
  description: "지리산 화개골에서 손으로 딴 잎으로 만드는 차.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-[12px] leading-[1.4]">
        {/* Fixed chrome stays outside the smoother, which transforms its content. */}
        <SiteHeader />
        <SmoothScroll>
          {/* Clears the fixed bar: 48px + 8px inset on mobile, 60px on desktop. */}
          <main className="pt-14 lg:pt-15">{children}</main>
        </SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
