import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";

const moderat = localFont({
  src: [
    {
      path: "./fonts/Moderat-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Moderat-Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-moderat",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Felt — klatre i Norge",
  description:
    "Finn klatrefelt i nærheten, sjekk forholdene og se om det har vært tørt nok til å klatre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="no"
      className={`${moderat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <TopNav />
        <div className="mx-auto flex min-h-screen max-w-[480px] flex-col pb-24 md:max-w-[1200px] md:pb-16">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
