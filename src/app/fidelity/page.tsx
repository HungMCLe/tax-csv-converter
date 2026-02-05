import type { Metadata } from "next";
import BrokerPage from "@/components/BrokerPage";
import Footer from "@/components/Footer";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export const metadata: Metadata = {
  title: "Fidelity 1099 to CSV — Convert Fidelity 1099-B PDF to CSV Free",
  description:
    "Convert your Fidelity 1099-B Tax Reporting Statement PDF to CSV for free. Extract all stock sales, capital gains, wash sales, and cost basis data. Ready for TurboTax, Schedule D, Form 8949. 100% private — runs in your browser.",
  keywords: [
    "Fidelity 1099 to CSV",
    "Fidelity 1099-B to CSV",
    "Fidelity 1099-B converter",
    "Fidelity tax form CSV",
    "Fidelity PDF to CSV",
    "convert Fidelity 1099",
    "Fidelity 1099-B tax reporting statement",
    "Fidelity capital gains CSV",
    "Fidelity Schedule D",
    "Fidelity TurboTax import",
  ],
  alternates: {
    canonical: "/fidelity",
  },
};

export default function FidelityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BrokerPage
        broker="fidelity"
        brokerName="Fidelity"
        color="green"
        tagline="Free tool to convert your Fidelity 1099-B Tax Reporting Statement PDF to a clean CSV file. Extract every transaction for TurboTax, Schedule D, or Form 8949."
        formName="1099-B Tax Reporting Statement"
        description="Fidelity sends 1099-B Tax Reporting Statements each year to customers who sold stocks, ETFs, mutual funds, or other securities. The PDF contains detailed transaction data organized by security, with each sale listed as a single line showing quantity, dates, proceeds, cost basis, and gain or loss. Our converter understands Fidelity's comma-separated description headers (security name, ticker symbol, CUSIP) and parses all transaction fields including accrued market discount and wash sale loss adjustments."
        features={[
          "All sale transactions with quantity, dates acquired and sold",
          "Proceeds (Box 1d) and cost or other basis (Box 1e)",
          "Accrued market discount (Box 1f) when applicable",
          "Wash sale loss disallowed (Box 1g) amounts",
          "Gain or loss calculation for each transaction",
          "Security description, ticker symbol, and CUSIP number",
          "Short-term vs long-term capital gains classification",
          "Federal and state tax withheld amounts",
          "Basis reported to IRS indicator",
        ]}
        steps={[
          {
            title: "Download your Fidelity 1099-B PDF",
            description:
              "Log into Fidelity.com, go to Accounts → Tax Forms, and download your 1099-B Tax Reporting Statement as a PDF.",
          },
          {
            title: "Upload to our converter",
            description:
              "Drag and drop your Fidelity PDF into the converter on our homepage. It automatically detects Fidelity's format.",
          },
          {
            title: "Review the summary",
            description:
              "See your total transactions, proceeds, cost basis, gains/losses, and wash sales at a glance. Verify the numbers match your Fidelity statement.",
          },
          {
            title: "Download your CSV",
            description:
              "Click Download CSV to get a clean file with all columns ready for TurboTax, H&R Block, or your CPA.",
          },
        ]}
      />
      <Footer />
      <BuyMeCoffee />
    </div>
  );
}
