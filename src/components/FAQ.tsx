"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Which brokers are supported?",
    answer:
      "We currently support Fidelity, Robinhood, and Charles Schwab 1099-B forms. The tool auto-detects your broker from the PDF. More brokers may be added in the future.",
  },
  {
    question: "Is this really free?",
    answer:
      "Yes, completely free with no limits. No sign-up, no email, no hidden fees. Use it as many times as you need.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. Your PDF is processed entirely in your browser using JavaScript. No data is ever uploaded to any server. You can verify this by checking your browser's Network tab \u2014 zero requests are made during processing.",
  },
  {
    question: "What tax forms does this work with?",
    answer:
      "This tool specifically parses 1099-B (Proceeds from Broker and Barter Exchange Transactions) data, which reports stock, ETF, and other security sales. It extracts all the fields needed for Schedule D and Form 8949.",
  },
  {
    question: "What columns are included in the CSV?",
    answer:
      "The CSV includes: Description (1a), CUSIP, Symbol, Quantity, Date Acquired (1b), Date Sold (1c), Proceeds (1d), Cost Basis (1e), Accrued Market Discount (1f), Wash Sale Loss Disallowed (1g), Gain/Loss, Federal Tax Withheld, Term (Short/Long), and Basis Reported to IRS.",
  },
  {
    question: "Can I use this CSV with TurboTax?",
    answer:
      "Yes! The CSV format is compatible with TurboTax's import feature for investment transactions. You can also use it with H&R Block, FreeTaxUSA, or hand it to your CPA.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Frequently Asked Questions
        </h2>
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
