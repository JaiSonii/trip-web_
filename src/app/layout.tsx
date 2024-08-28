import type { Metadata } from "next";
import '@/app/globals.css';
import { cn } from "@/lib/utils";
import { Roboto as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "100"
});

export const metadata: Metadata = {
  title: "Awajahi Web",
  description : 'Moving India One Mile at a time'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
