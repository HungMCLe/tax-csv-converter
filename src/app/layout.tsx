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

const SITE_URL = "https://tax-csv-converter.vercel.app";

export const metadata: Metadata = {
  title: {
    default:
      "1099 to CSV Converter — Free 1099-B PDF to CSV Tool | Fidelity, Robinhood, Schwab",
    template: "%s | 1099 to CSV Converter",
  },
  description:
    "Free online tool to convert 1099-B tax form PDFs to CSV. Supports Fidelity, Robinhood, and Charles Schwab. 100% private — runs entirely in your browser. Export transactions for TurboTax, Schedule D, Form 8949.",
  keywords: [
    "1099 to CSV",
    "1099-B to CSV",
    "1099-B converter",
    "1099 PDF to CSV",
    "convert 1099 to CSV",
    "1099-B PDF converter",
    "Fidelity 1099 to CSV",
    "Robinhood 1099 to CSV",
    "Schwab 1099 to CSV",
    "tax form converter",
    "Schedule D CSV",
    "Form 8949 CSV",
    "TurboTax 1099 import",
    "1099-B transactions CSV",
    "stock sales CSV",
    "capital gains CSV",
    "wash sale CSV",
    "broker tax form converter",
    "free 1099 converter",
    "1099-B parser",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "1099 to CSV Converter",
    title: "1099 to CSV — Free 1099-B PDF to CSV Converter",
    description:
      "Convert your 1099-B tax forms from Fidelity, Robinhood, or Schwab to CSV instantly. 100% free, 100% private — all processing happens in your browser.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "1099 to CSV Converter — Convert tax form PDFs to CSV for free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1099 to CSV — Free 1099-B PDF to CSV Converter",
    description:
      "Convert 1099-B tax form PDFs to CSV. Supports Fidelity, Robinhood, Schwab. Free, private, instant.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-site-verification": "", // Add your Google Search Console verification code here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "1099 to CSV Converter",
    url: SITE_URL,
    description:
      "Free online tool to convert 1099-B tax form PDFs to CSV. Supports Fidelity, Robinhood, and Charles Schwab.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Convert Fidelity 1099-B PDF to CSV",
      "Convert Robinhood 1099-B PDF to CSV",
      "Convert Charles Schwab 1099-B PDF to CSV",
      "Auto-detect broker type",
      "100% client-side processing",
      "Schedule D and Form 8949 compatible",
      "TurboTax CSV import ready",
      "Wash sale loss tracking",
      "Short-term and long-term capital gains",
    ],
    browserRequirements: "Requires JavaScript",
    permissions: "none",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I convert my 1099-B PDF to CSV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your 1099-B PDF from Fidelity, Robinhood, or Charles Schwab. The tool automatically detects your broker, parses every transaction, and lets you download a clean CSV file ready for TurboTax, Schedule D, or Form 8949.",
        },
      },
      {
        "@type": "Question",
        name: "Which brokers are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently supports Fidelity, Robinhood, and Charles Schwab 1099-B tax forms. The tool auto-detects your broker from the PDF content.",
        },
      },
      {
        "@type": "Question",
        name: "Is this 1099-B to CSV converter free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free with no limits. No sign-up, no email, no hidden fees. Use it as many times as you need for tax season.",
        },
      },
      {
        "@type": "Question",
        name: "Is my tax data safe when converting 1099-B to CSV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your PDF is processed entirely in your browser using JavaScript. No data is ever uploaded to any server. You can verify this by checking your browser's Network tab — zero requests are made during processing.",
        },
      },
      {
        "@type": "Question",
        name: "Can I import the CSV into TurboTax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! The CSV format is compatible with TurboTax's import feature for investment transactions. You can also use it with H&R Block, FreeTaxUSA, or hand it to your CPA.",
        },
      },
      {
        "@type": "Question",
        name: "What columns are included in the 1099-B CSV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The CSV includes all IRS-required fields: Description (1a), CUSIP, Symbol, Date Acquired (1b), Date Sold (1c), Proceeds (1d), Cost Basis (1e), Accrued Market Discount (1f), Wash Sale Loss Disallowed (1g), Gain/Loss, Federal Tax Withheld (4), Term (Short/Long), and Basis Reported to IRS (12).",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
