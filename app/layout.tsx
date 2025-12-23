import type { Metadata } from "next";
import {  Jost } from "next/font/google";
import "./globals.css";

const jostSans = Jost({
  weight: ["100","200","300", "400","500","600", "700", "800","900"],
})

export const metadata: Metadata = {
  title: "XDesign - AI Mobile Design Agent",
  description: "Generate mobile app designs with AI-powered assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jostSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
