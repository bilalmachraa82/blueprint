import '@/polyfills'; // Polyfill for crypto.randomUUID
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StackProvider } from "@/providers/StackProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blueprint Pro - Professional Work Order Management",
  description: "Advanced manufacturing work order management system by IMASD",
  keywords: "work orders, manufacturing, quality control, task management, IMASD",
  authors: [{ name: "IMASD" }],
  openGraph: {
    title: "Blueprint Pro",
    description: "Professional Work Order Management System",
    type: "website",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="crypto-polyfill" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && !window.crypto) {
              window.crypto = {};
            }
            if (typeof window !== 'undefined' && typeof window.crypto.randomUUID !== 'function') {
              window.crypto.randomUUID = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
              };
            }
          `}
        </Script>
        <StackProvider>
          {children}
        </StackProvider>
      </body>
    </html>
  );
}
