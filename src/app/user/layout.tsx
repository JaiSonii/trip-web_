import type { Metadata } from "next";
import "@/app/globals.css";
import dynamic from 'next/dynamic';

const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), { ssr: false });

import { Inter as FontSans } from "next/font/google"
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Awajahi Web",
  description: "Web Interface for Awajahi Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  

  return (
        <div className="flex flex-row">
          <div className="w-1/6">
          <MainLayout/>
          </div>
          <div className="w-5/6">
          {children}
          </div>
        </div>
  );
}




