import '@/polyfills'; // Polyfill for crypto.randomUUID
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StackProvider } from "@/providers/StackProvider";
import { StackTheme } from "@stackframe/stack"; // Keep StackTheme for direct use
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
            if (typeof window !== 'undefined') {
              // Ensure crypto object exists
              if (!window.crypto) {
                window.crypto = {};
              }
              
              // Polyfill randomUUID
              if (!window.crypto.randomUUID) {
                window.crypto.randomUUID = function() {
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                };
              }
              
              // Polyfill crypto.subtle with basic SHA-256 support
              if (!window.crypto.subtle) {
                window.crypto.subtle = {
                  digest: function(algorithm, data) {
                    return new Promise(function(resolve, reject) {
                      if (algorithm !== 'SHA-256') {
                        reject(new Error('Only SHA-256 is supported'));
                        return;
                      }
                      
                      // Convert to string for hashing
                      var text = '';
                      if (data instanceof ArrayBuffer) {
                        var bytes = new Uint8Array(data);
                        for (var i = 0; i < bytes.length; i++) {
                          text += String.fromCharCode(bytes[i]);
                        }
                      } else {
                        text = data.toString();
                      }
                      
                      // Simple hash (not cryptographically secure, but works for development)
                      var hash = 0;
                      for (var i = 0; i < text.length; i++) {
                        var char = text.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash;
                      }
                      
                      // Convert to ArrayBuffer
                      var buffer = new ArrayBuffer(32);
                      var view = new DataView(buffer);
                      for (var i = 0; i < 8; i++) {
                        view.setUint32(i * 4, Math.abs(hash) + i, false);
                      }
                      
                      resolve(buffer);
                    });
                  }
                };
              }
              
              // Polyfill getRandomValues if needed
              if (!window.crypto.getRandomValues) {
                window.crypto.getRandomValues = function(array) {
                  for (var i = 0; i < array.length; i++) {
                    array[i] = Math.floor(Math.random() * 256);
                  }
                  return array;
                };
              }
            }
          `}
        </Script>
        <StackProvider>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
