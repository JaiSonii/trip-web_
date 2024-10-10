import type { Metadata } from "next";
import "@/app/globals.css";
import dynamic from 'next/dynamic';
import { Roboto } from 'next/font/google';

// Import Roboto font from Google Fonts
const roboto = Roboto({
  subsets: ['latin'], // Define which character subsets to include (e.g., Latin)
  weight: ['400', '500', '700'], // Define which font weights to include
  variable: '--font-roboto', // Variable to be used in CSS
});

// Dynamically import MainLayout without SSR
const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), { ssr: false });

export const metadata: Metadata = {
  title: "Awajahi",
  description: "Moving India One Mile at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <div className="flex flex-row">
          {/* Sidebar: 3/12 width */}
          <div className="w-screen">
            <MainLayout>{children}</MainLayout>
          </div>
        </div>
      </body>
    </html>
  );
}
