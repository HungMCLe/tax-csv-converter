"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I convert my 1099-B PDF to CSV?",
    answer:
      "Simply drag and drop your 1099-B PDF into the converter above. The tool automatically detects whether it's from Fidelity, Robinhood, or Charles Schwab, extracts every transaction, and generates a downloadable CSV file — all in seconds.",
  },
  {
    question: "Which brokers are supported?",
    answer:
      "We currently support Fidelity (1099-B Tax Reporting Statements), Robinhood (Consolidated Form 1099), and Charles Schwab (1099 Composite and Year-End Summary). The tool auto-detects your broker from the PDF. More brokers may be added in the future.",
  },
  {
    question: "Is this 1099 to CSV converter really free?",
    answer:
      "Yes, completely free with no limits. No sign-up, no email, no hidden fees. Use it as many times as you need during tax season.",
  },
  {
    question: "Is my tax data safe?",
    answer:
      "Absolutely. Your PDF is processed entirely in your browser using JavaScript. No data is ever uploaded to any server. You can verify this by checking your browser's Network tab — zero requests are made during processing. The source code is also open source on GitHub for full transparency.",
  },
  {
    question: "Can I import the CSV into TurboTax?",
    answer:
      "Yes! The CSV format is compatible with TurboTax's import feature for investment transactions. You can also use it with H&R Block, FreeTaxUSA, Tax Act, or hand it to your CPA for Schedule D and Form 8949 preparation.",
  },
  {
    question: "What tax forms does this work with?",
    answer:
      "This tool specifically parses 1099-B (Proceeds from Broker and Barter Exchange Transactions) data, which reports stock, ETF, mutual fund, and other security sales. It extracts all the fields needed for IRS Schedule D and Form 8949, including short-term and long-term capital gains.",
  },
  {
    question: "Does it handle wash sales and cost basis adjustments?",
    answer:
      "Yes. The converter extracts wash sale loss disallowed amounts (Box 1g), accrued market discount (Box 1f), and cost basis (Box 1e) — including cases where cost basis is marked as 'Not Provided'. All fields are carried over accurately to the CSV.",
  },
  {
    question: "What columns are included in the CSV?",
    answer:
      "The CSV includes all IRS-required fields: Description (1a), CUSIP, Symbol, Quantity, Date Acquired (1b), Date Sold (1c), Proceeds (1d), Cost Basis (1e), Accrued Market Discount (1f), Wash Sale Loss Disallowed (1g), Gain/Loss, Federal Tax Withheld (4), Term (Short-term or Long-term), and Basis Reported to IRS (12).",
  },
  {
    question: "How do I convert my Fidelity 1099 to CSV?",
    answer:
      "Upload your Fidelity 1099-B Tax Reporting Statement PDF using the converter above. It automatically detects Fidelity's format, parses all 'Sale' transaction lines with their security descriptions, CUSIPs, dates, proceeds, cost basis, wash sales, and gain/loss amounts. The CSV download starts instantly.",
  },
  {
    question: "How do I convert my Schwab 1099 to CSV?",
    answer:
      "Upload your Charles Schwab 1099 Composite PDF. The converter handles Schwab's unique two-line transaction format, including dollar-sign prefixed amounts, parenthesized negative values, 'Not Provided' cost basis, and even three-line entries for matured bonds like Treasury notes.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Everything you need to know about converting 1099-B tax forms to CSV
        </p>
        <div className="mt-10 space-y-2">
          {faqs.map((faq, i) => (
            <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQAccordion({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {question}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
}
