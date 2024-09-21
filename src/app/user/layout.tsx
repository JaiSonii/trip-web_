import type { Metadata } from "next";
import "@/app/globals.css";
import dynamic from 'next/dynamic';

const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), { ssr: false });

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
      {/* Sidebar: 3/12 width */}
      <div className="w-screen">
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  );
}
