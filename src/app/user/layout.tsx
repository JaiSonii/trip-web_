import type { Metadata } from "next";
import "@/app/globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Inter as FontSans } from "next/font/google"
import { AuthProvider } from "@/components/AuthProvider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  

  return (
    <AuthProvider>
        <div className="flex flex-row">
          <div className="w-1/6">
          <MainLayout/>
          </div>
          <div className="w-5/6">
          {children}
          </div>
        </div>
        </AuthProvider>
  );
}




