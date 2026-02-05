import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1099 to CSV — Free Tax Form Converter",
  description:
    "Convert your 1099-B tax forms from Fidelity, Robinhood, or Schwab to CSV. 100% free, 100% private — all processing happens in your browser.",
  keywords: [
    "1099",
    "1099-B",
    "CSV",
    "tax",
    "converter",
    "Fidelity",
    "Robinhood",
    "Schwab",
    "Schedule D",
    "Form 8949",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
