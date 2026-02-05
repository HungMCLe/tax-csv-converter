import type { Metadata } from "next";
import BrokerPage from "@/components/BrokerPage";
import Footer from "@/components/Footer";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export const metadata: Metadata = {
  title: "Robinhood 1099 to CSV — Convert Robinhood 1099-B PDF to CSV Free",
  description:
    "Convert your Robinhood Consolidated Form 1099 PDF to CSV for free. Extract all stock and crypto sales, capital gains, wash sales, and cost basis. Ready for TurboTax, Schedule D, Form 8949. 100% private.",
  keywords: [
    "Robinhood 1099 to CSV",
    "Robinhood 1099-B to CSV",
    "Robinhood 1099 converter",
    "Robinhood tax form CSV",
    "Robinhood PDF to CSV",
    "convert Robinhood 1099",
    "Robinhood consolidated form 1099",
    "Robinhood capital gains CSV",
    "Robinhood Schedule D",
    "Robinhood TurboTax import",
    "Robinhood stock sales CSV",
  ],
  alternates: {
    canonical: "/robinhood",
  },
};

export default function RobinhoodPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BrokerPage
        broker="robinhood"
        brokerName="Robinhood"
        color="lime"
        tagline="Free tool to convert your Robinhood Consolidated Form 1099 PDF to a clean CSV file. Extract every stock and options transaction for TurboTax, Schedule D, or Form 8949."
        formName="Consolidated Form 1099"
        description="Robinhood issues a Consolidated Form 1099 that includes 1099-B broker transaction data for all securities sold during the tax year. Robinhood's PDF format uses a date-first column layout with dots (...) for empty fields and special markers like W for wash sales and D for market discount. Our converter handles all of these quirks, including Robinhood's merged text patterns and security descriptions with embedded CUSIP numbers."
        features={[
          "All sale transactions with quantity, date sold, and date acquired",
          "Proceeds (Box 1d) with gross/net indicator",
          "Cost or other basis (Box 1e) for covered and noncovered lots",
          "Wash sale loss disallowed (Box 1g) with W marker detection",
          "Accrued market discount with D marker detection",
          "Gain or loss for each individual transaction",
          "Security description with CUSIP and ticker symbol",
          "Short-term and long-term transaction classification",
          "Covered vs noncovered tax lot separation",
        ]}
        steps={[
          {
            title: "Download your Robinhood 1099 PDF",
            description:
              "Open the Robinhood app or website, go to Account → Tax Documents, and download your Consolidated Form 1099 as a PDF.",
          },
          {
            title: "Upload to our converter",
            description:
              "Drag and drop your Robinhood PDF into the converter on our homepage. It automatically detects Robinhood's unique format.",
          },
          {
            title: "Review the summary",
            description:
              "See your total transactions, proceeds, cost basis, gains/losses, and wash sales. Compare against your Robinhood tax summary.",
          },
          {
            title: "Download your CSV",
            description:
              "Click Download CSV to get a clean file with all columns formatted for TurboTax, H&R Block, FreeTaxUSA, or your CPA.",
          },
        ]}
      />
      <Footer />
      <BuyMeCoffee />
    </div>
  );
}
