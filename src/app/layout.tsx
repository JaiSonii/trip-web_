import type { Metadata } from "next";
import '@/app/globals.css';
import { cn } from "@/lib/utils";
import { Roboto as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import logo from '@/assets/awajahi logo.png'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "100"
});

export const metadata: Metadata = {
  title: "Awajahi Web - Moving India One Mile at a Time",
  description: "Awajahi Web is transforming transportation in India, one mile at a time. Discover our services and how we are moving India efficiently and reliably.",
  keywords: ["Awajahi", "Transport", "Logistics", "India", "Moving Services", "Web Application", "Fleet Management","awajahi"],
  authors: [{ name: "Awajahi Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Awajahi Web - Moving India One Mile at a Time",
    description: "Explore Awajahi Web for reliable and efficient transportation services across India.",
    url: "https://www.awajahi.com",
    type: "website",
    locale: "en_US",
    
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
