import type { Metadata } from "next";
import './globals.css';
import { cn } from "@/lib/utils";
import { Roboto as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

// Load Roboto font with multiple weights
const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],  // Add multiple weights as needed
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Awajahi - Moving India One Mile at a Time",
  description: "Awajahi is transforming transportation in India, one mile at a time. Discover our services and how we are moving India efficiently and reliably.",
  keywords: ["Awajahi", "Transport", "Logistics", "India", "Moving Services", "Web Application", "Fleet Management","awajahi"],
  authors: [{ name: "Awajahi Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Awajahi - Moving India One Mile at a Time",
    description: "Explore Awajahi for reliable and efficient transportation services across India.",
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
          "min-h-screen bg-background font-roboto antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
