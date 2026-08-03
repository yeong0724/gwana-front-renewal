import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChromeHeader } from "@/components/layout/chrome-header";
import { PageTransition } from "@/components/layout/page-transition";
import { PaymentHeader } from "@/components/layout/payment-header";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { Toaster } from "@/components/ui/shadcn-ui/sonner";
import { BG, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";

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
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "h-full antialiased",
      )}
    >
      <body
        className={cn(
          "min-h-full text-[12px] leading-[1.4]",
          BG.page,
          TEXT.ink,
        )}
      >
        {/*
         * Fixed chrome stays outside the smoother, which transforms its content.
         * That is why the header cannot live in a route group layout: those
         * render inside #view. The switch is the one client component here; both
         * headers stay server components because they arrive as props.
         */}
        <ChromeHeader common={<SiteHeader />} nonCommon={<PaymentHeader />} />
        <SmoothScroll>
          {/*
           * The smoother and the transition stay in the root layout so crossing
           * route groups never unmounts them. Moving them into the group layouts
           * would kill and rebuild ScrollSmoother on every crossing, and the
           * remounted PageTransition would skip its fade-in.
           *
           * <main> and the footer belong to the group layouts (§9.E).
           */}
          <PageTransition>{children}</PageTransition>
        </SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
