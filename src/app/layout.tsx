import type { Metadata } from "next";
import './globals.css';
import { cn } from "@/lib/utils";
import { Roboto as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

// Load Roboto font with multiple weights
const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],  // Add multiple weights as needed
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Awajahi - Moving India One Mile at a Time",
  description: "Awajahi is transforming transportation in India, one mile at a time. Discover our services and how we are moving India efficiently and reliably.",
  keywords: ["Awajahi", "Transport", "Logistics", "India", "Moving Services", "Web Application", "Fleet Management", "awajahi"],
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
    images: [
      {
        url: "https://www.awajahi.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fawajahi%20logo.e4977a4d.png&w=64&q=75", // Update this URL to the path of your logo
        width: 1200,
        height: 630,
        alt: "Awajahi Logo",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico", // Add your favicon here
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-BMXWP592W0`} // Replace with your Measurement ID
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BMXWP592W0'); // Replace with your Measurement ID
          `}
        </Script>
      </head>
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
