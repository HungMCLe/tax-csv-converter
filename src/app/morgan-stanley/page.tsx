import type { Metadata } from "next";
import BrokerPage from "@/components/BrokerPage";
import Footer from "@/components/Footer";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export const metadata: Metadata = {
  title: "Morgan Stanley 1099 to CSV — Convert Morgan Stanley 1099-B PDF to CSV Free",
  description:
    "Convert your Morgan Stanley 1099-B Stock Plan Account PDF to CSV for free. Extract all stock sales, capital gains, wash sales, and cost basis data. Ready for TurboTax, Schedule D, Form 8949. 100% private — runs in your browser.",
  keywords: [
    "Morgan Stanley 1099 to CSV",
    "Morgan Stanley 1099-B to CSV",
    "Morgan Stanley 1099-B converter",
    "Morgan Stanley tax form CSV",
    "Morgan Stanley PDF to CSV",
    "convert Morgan Stanley 1099",
    "Morgan Stanley stock plan 1099-B",
    "Morgan Stanley capital gains CSV",
    "Morgan Stanley Schedule D",
    "Morgan Stanley TurboTax import",
  ],
  alternates: {
    canonical: "/morgan-stanley",
  },
};

export default function MorganStanleyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BrokerPage
        broker="morgan-stanley"
        brokerName="Morgan Stanley"
        color="indigo"
        tagline="Free tool to convert your Morgan Stanley 1099-B Stock Plan Account PDF to a clean CSV file. Extract every transaction for TurboTax, Schedule D, or Form 8949."
        formName="1099-B Stock Plan Account Statement"
        description="Morgan Stanley issues 1099-B Stock Plan Account statements to employees and clients who sold stocks through their equity compensation plans. The PDF lists transactions organized by term (short-term vs long-term) and coverage status (covered vs noncovered securities). Each transaction includes the security description, CUSIP number, quantity, dates acquired and sold, proceeds, and cost basis. Our converter handles all Morgan Stanley 1099-B formats including consolidated tax statements and stock plan account forms."
        features={[
          "All sale transactions with quantity, dates acquired and sold",
          "Proceeds (Box 1d) and cost or other basis (Box 1e)",
          "Wash sale loss disallowed (Box 1g) amounts when present",
          "Gain or loss calculation for each transaction",
          "Security description and CUSIP number",
          "Short-term vs long-term capital gains classification",
          "Covered vs noncovered securities distinction",
          "Federal income tax withheld amounts",
          "Support for VARIOUS date acquired entries",
        ]}
        steps={[
          {
            title: "Download your Morgan Stanley 1099-B PDF",
            description:
              "Log into Morgan Stanley at Work (atwork.morganstanley.com), go to your Document Library, and download your 1099-B Stock Plan Account statement as a PDF.",
          },
          {
            title: "Upload to our converter",
            description:
              "Drag and drop your Morgan Stanley PDF into the converter on our homepage. It automatically detects the Morgan Stanley format.",
          },
          {
            title: "Review the summary",
            description:
              "See your total transactions, proceeds, cost basis, gains/losses, and wash sales at a glance. Verify the numbers match your Morgan Stanley statement.",
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
