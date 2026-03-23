import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KOL Connect - Empowering the Creator Economy",
  description:
    "All-in-one platform for KOLs and Brands with AI-driven matching, real-time analytics, and secure payments.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body
        className={`${inter.variable} bg-background-light text-foreground antialiased dark:bg-background-dark dark:text-foreground`}
      >
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

