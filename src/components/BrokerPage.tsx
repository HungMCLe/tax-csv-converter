"use client";

import { BrokerType } from "@/lib/parsers/types";

interface BrokerPageProps {
  broker: BrokerType;
  brokerName: string;
  color: string;
  tagline: string;
  description: string;
  features: string[];
  formName: string;
  steps: { title: string; description: string }[];
}

export default function BrokerPage({
  brokerName,
  color,
  tagline,
  description,
  features,
  formName,
  steps,
}: BrokerPageProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    green: {
      bg: "from-green-50 to-white dark:from-green-950 dark:to-gray-950",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      badge: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    lime: {
      bg: "from-lime-50 to-white dark:from-lime-950 dark:to-gray-950",
      text: "text-lime-600 dark:text-lime-400",
      border: "border-lime-200 dark:border-lime-800",
      badge: "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800",
    },
    sky: {
      bg: "from-sky-50 to-white dark:from-sky-950 dark:to-gray-950",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-200 dark:border-sky-800",
      badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    },
  };

  const colors = colorMap[color] || colorMap.green;

  return (
    <>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-b ${colors.bg} pb-16 pt-20`}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className={`mb-4 inline-flex items-center rounded-full border ${colors.badge} px-4 py-1.5 text-sm font-medium`}>
            {brokerName} 1099-B Converter
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
            Convert{" "}
            <span className={colors.text}>{brokerName} 1099</span>{" "}
            to CSV
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            {tagline}
          </p>

          <div className="mt-8">
            <a
              href="/#converter"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload {brokerName} PDF
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>100% free &middot; 100% private &middot; Runs in your browser</span>
          </div>
        </div>
      </section>

      {/* About this broker's format */}
      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            About {brokerName} {formName}
          </h2>
          <p className="mt-4 text-gray-600 leading-7 dark:text-gray-400">
            {description}
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">
            What our converter extracts from your {brokerName} 1099:
          </h3>
          <ul className="mt-4 space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className={`mt-0.5 h-4 w-4 shrink-0 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Step by step */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            How to Convert Your {brokerName} 1099 to CSV
          </h2>
          <div className="mt-8 space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.badge} text-sm font-bold`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/#converter"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Convert My {brokerName} 1099 Now
            </a>
          </div>
        </div>
      </section>

      {/* Other brokers */}
      <section className="bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Also supports:{" "}
            {[
              brokerName !== "Fidelity" && (
                <a key="fidelity" href="/fidelity" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Fidelity 1099 to CSV</a>
              ),
              brokerName !== "Robinhood" && (
                <a key="robinhood" href="/robinhood" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Robinhood 1099 to CSV</a>
              ),
              brokerName !== "Charles Schwab" && (
                <a key="schwab" href="/schwab" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Schwab 1099 to CSV</a>
              ),
            ]
              .filter(Boolean)
              .reduce<React.ReactNode[]>((acc, link, i) => {
                if (i > 0) acc.push(<span key={`sep-${i}`}> · </span>);
                acc.push(link);
                return acc;
              }, [])}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <a href="/" className="font-medium text-blue-600 hover:underline dark:text-blue-400">← Back to homepage</a>
          </p>
        </div>
      </section>
    </>
  );
}
