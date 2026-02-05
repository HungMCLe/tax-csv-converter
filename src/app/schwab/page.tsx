import type { Metadata } from "next";
import BrokerPage from "@/components/BrokerPage";
import Footer from "@/components/Footer";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export const metadata: Metadata = {
  title:
    "Schwab 1099 to CSV — Convert Charles Schwab 1099-B PDF to CSV Free",
  description:
    "Convert your Charles Schwab 1099 Composite PDF to CSV for free. Extract all stock, ETF, bond, and Treasury sales including wash sales and cost basis. Ready for TurboTax, Schedule D, Form 8949. 100% private.",
  keywords: [
    "Schwab 1099 to CSV",
    "Charles Schwab 1099 to CSV",
    "Schwab 1099-B to CSV",
    "Schwab 1099 converter",
    "Schwab tax form CSV",
    "Schwab PDF to CSV",
    "convert Schwab 1099",
    "Charles Schwab 1099 composite",
    "Schwab capital gains CSV",
    "Schwab Schedule D",
    "Schwab TurboTax import",
  ],
  alternates: {
    canonical: "/schwab",
  },
};

export default function SchwabPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BrokerPage
        broker="schwab"
        brokerName="Charles Schwab"
        color="sky"
        tagline="Free tool to convert your Charles Schwab 1099 Composite PDF to a clean CSV file. Handles stocks, ETFs, bonds, and Treasury notes for TurboTax, Schedule D, or Form 8949."
        formName="1099 Composite and Year-End Summary"
        description="Charles Schwab issues a 1099 Composite and Year-End Summary that includes 1099-B broker transaction data. Schwab's PDF uses a unique two-line format per transaction: the first line contains the quantity, description, dates, and dollar amounts (prefixed with $), while the second line has the CUSIP, ticker symbol, date sold, and wash sale data. Our converter handles all of Schwab's formatting quirks including parenthesized negative values, 'Not Provided' cost basis, and three-line entries for matured Treasury bonds."
        features={[
          "Two-line and three-line transaction format parsing",
          "Dollar-sign ($) prefixed amount handling",
          "Parenthesized negative values like $(0.03) correctly parsed",
          "\"Not Provided\" cost basis for noncovered securities (e.g., Bitwise Bitcoin ETF)",
          "Matured Treasury bond and note handling (3-line format)",
          "Proceeds (Box 1d) and cost or other basis (Box 1e)",
          "Accrued market discount (Box 1f) for bonds",
          "Wash sale loss disallowed (Box 1g) amounts",
          "Short-term and long-term with basis reported/missing/available classification",
          "Federal income tax withheld (Box 4)",
        ]}
        steps={[
          {
            title: "Download your Schwab 1099 PDF",
            description:
              "Log into Schwab.com, go to Accounts → Tax Forms → 1099 Composite, and download the PDF.",
          },
          {
            title: "Upload to our converter",
            description:
              "Drag and drop your Schwab PDF into the converter on our homepage. It automatically detects Schwab's two-line transaction format.",
          },
          {
            title: "Review the summary",
            description:
              "See your total transactions, proceeds, cost basis, gains/losses, and wash sales. Verify against the totals on your Schwab statement.",
          },
          {
            title: "Download your CSV",
            description:
              "Click Download CSV to get a clean file with all columns ready for TurboTax, H&R Block, or your tax professional.",
          },
        ]}
      />
      <Footer />
      <BuyMeCoffee />
    </div>
  );
}
