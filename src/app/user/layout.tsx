'use client'
import "@/app/globals.css";
import dynamic from 'next/dynamic';
import { Roboto } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

// Import Roboto font from Google Fonts
const roboto = Roboto({
  subsets: ['latin'], // Define which character subsets to include (e.g., Latin)
  weight: ['400', '500', '700'], // Define which font weights to include
  variable: '--font-roboto', // Variable to be used in CSS
});

// Dynamically import MainLayout without SSR
const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), { ssr: false });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((err) => console.error('Service Worker registration failed:', err));

      // Request notification permissions for /user/* pages
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notifications are enabled');
          } else {
            console.warn('Notifications are disabled');
          }
        });
      }
    }
  }, []);
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <div className="flex flex-row">
          {/* Sidebar: 3/12 width */}
          <div className="w-screen">
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
